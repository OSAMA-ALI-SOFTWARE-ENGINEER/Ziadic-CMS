<?php

namespace App\Http\Controllers\Admin;

use App\Models\Listing;
use App\Models\Category;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ListingController
{
    public function index(Request $request)
    {
        $query = Listing::with(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name', 'mediaFiles']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('submission_source')) {
            $query->where('submission_source', $request->string('submission_source'));
        }

        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', "%{$request->search}%")
                    ->orWhere('business_name', 'like', "%{$request->search}%");
            });
        }

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        $perPage = (int) $request->input('per_page', 15);
        $listings = $query->orderByDesc('created_at')->paginate($perPage);

        // Log to verify mediaFiles are loaded and serialized
        if ($listings->count() > 0) {
            $first = $listings->first();
            \Log::info('🎨 Listing index - mediaFiles status', [
                'first_listing_id' => $first->id,
                'title' => $first->title,
                'mediaFiles_loaded' => $first->relationLoaded('mediaFiles'),
                'mediaFiles_count' => $first->mediaFiles->count(),
            ]);
        }

        return response()->json($listings);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'description' => 'nullable|string',
            'city_id' => 'nullable|exists:cities,id',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website_url' => 'nullable|string|max:500',
            'slug' => 'nullable|string|max:255|unique:listings,slug',
            'status' => ['nullable', Rule::in(['draft', 'pending', 'approved', 'rejected', 'published'])],
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'popular_order' => 'nullable|integer|min:0|max:2',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'submission_payload' => 'nullable|array',
            // New detail fields
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_website' => 'nullable|string|max:500',
            'contact_address' => 'nullable|string',
            'open_days' => 'nullable|string',
            'open_time' => 'nullable|regex:/^\d{1,2}:\d{2}$/',
            'close_time' => 'nullable|regex:/^\d{1,2}:\d{2}$/',
            'weekend_text' => 'nullable|string',
            'details_heading' => 'nullable|string',
            'details_items' => 'nullable|array',
            'details_items.*' => 'string',
            'facilities_heading' => 'nullable|string',
            'facilities_items' => 'nullable|array',
            'facilities_items.*' => 'string',
            'gallery_heading' => 'nullable|string',
            'thumbnail_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'gallery_image_ids' => 'nullable|array',
            'gallery_image_ids.*' => 'integer|exists:custom_media,id',
        ]);

        $userId = $request->user()?->getAuthIdentifier();
        abort_unless($userId, 401);

        $validated['owner_id'] = $userId;
        $validated['slug'] = $validated['slug'] ?? str($validated['title'])->slug();
        $validated['status'] = $validated['status'] ?? 'draft';
        $validated['submission_source'] = 'admin';

        $categories = $validated['categories'] ?? [];
        unset($validated['categories']);

        $listing = Listing::create($validated);

        if (!empty($categories)) {
            $listing->categories()->sync($categories);
        }

        // Handle gallery images (legacy path format)
        if (!empty($validated['gallery_images'])) {
            $this->syncGalleryImages($listing, $validated['gallery_images']);
        }

        // Handle new media-based gallery (sync replaces existing)
        if ($request->has('gallery_image_ids')) {
            $mediaIds = $request->input('gallery_image_ids');
            \Log::info('🎨 Gallery sync on create', [
                'listing_id' => $listing->id,
                'received_ids' => $mediaIds,
                'is_array' => is_array($mediaIds),
                'count' => is_array($mediaIds) ? count($mediaIds) : 0,
            ]);

            if (is_array($mediaIds) && !empty($mediaIds)) {
                $listing->mediaFiles()->sync($mediaIds);

                // Verify sync was successful
                $verifyCount = $listing->mediaFiles()->count();
                \Log::info('🎨 Gallery synced on create - verify', [
                    'listing_id' => $listing->id,
                    'synced_count' => count($mediaIds),
                    'verified_count' => $verifyCount,
                ]);
            }
        }

        ActivityLogger::log('listing.created', $listing, [
            'new' => $listing->only(['title', 'status', 'submission_source']),
        ], $request);

        return response()->json($listing->load(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name', 'mediaFiles']), 201);
    }

    public function show(Listing $listing)
    {
        $listing->load(['city:id,name', 'categories:id,name', 'owner:id,name', 'images', 'mediaFiles', 'hours', 'facilities', 'contacts']);

        \Log::info('🎨 Listing show - mediaFiles status', [
            'listing_id' => $listing->id,
            'title' => $listing->title,
            'mediaFiles_loaded' => $listing->relationLoaded('mediaFiles'),
            'mediaFiles_count' => $listing->mediaFiles->count(),
        ]);

        return response()->json($listing);
    }

    public function update(Request $request, Listing $listing)
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'business_name' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string',
            'description' => 'nullable|string',
            'city_id' => 'nullable|exists:cities,id',
            'address' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'email' => 'nullable|email',
            'phone' => 'nullable|string',
            'website_url' => 'nullable|string|max:500',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('listings', 'slug')->ignore($listing->id)],
            'status' => ['nullable', Rule::in(['draft', 'pending', 'approved', 'rejected', 'published'])],
            'is_featured' => 'boolean',
            'is_popular' => 'boolean',
            'popular_order' => 'nullable|integer|min:0|max:2',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            // New detail fields
            'contact_phone' => 'nullable|string',
            'contact_email' => 'nullable|email',
            'contact_website' => 'nullable|string|max:500',
            'contact_address' => 'nullable|string',
            'open_days' => 'nullable|string',
            'open_time' => 'nullable|regex:/^\d{1,2}:\d{2}$/',
            'close_time' => 'nullable|regex:/^\d{1,2}:\d{2}$/',
            'weekend_text' => 'nullable|string',
            'details_heading' => 'nullable|string',
            'details_items' => 'nullable|array',
            'details_items.*' => 'string',
            'facilities_heading' => 'nullable|string',
            'facilities_items' => 'nullable|array',
            'facilities_items.*' => 'string',
            'gallery_heading' => 'nullable|string',
            'thumbnail_image' => 'nullable|string',
            'gallery_images' => 'nullable|string',
            'gallery_image_ids' => 'nullable|array',
            'gallery_image_ids.*' => 'integer|exists:custom_media,id',
        ]);

        $categories = $validated['categories'] ?? null;
        unset($validated['categories']);

        $old = $listing->only(array_keys($validated));
        $submissionPayload = $validated['submission_payload'] ?? null;
        unset($validated['submission_payload']);

        $listing->update($validated);

        if (isset($categories)) {
            $listing->categories()->sync($categories);
        }

        // Handle gallery images (both legacy path format and new media IDs)
        if (!empty($validated['gallery_images'])) {
            $this->syncGalleryImages($listing, $validated['gallery_images']);
        }

        // Handle new media-based gallery (sync replaces existing)
        if ($request->has('gallery_image_ids')) {
            $mediaIds = $request->input('gallery_image_ids');
            \Log::info('🎨 Gallery sync requested', [
                'listing_id' => $listing->id,
                'received_ids' => $mediaIds,
                'is_array' => is_array($mediaIds),
                'count' => is_array($mediaIds) ? count($mediaIds) : 0,
            ]);

            if (is_array($mediaIds) && !empty($mediaIds)) {
                $listing->mediaFiles()->sync($mediaIds);

                // Verify sync was successful
                $verifyCount = $listing->mediaFiles()->count();
                \Log::info('🎨 Gallery synced - verify', [
                    'listing_id' => $listing->id,
                    'synced_count' => count($mediaIds),
                    'verified_count' => $verifyCount,
                ]);
            } else {
                // Empty array means remove all gallery images
                $listing->mediaFiles()->detach();
                \Log::info('🎨 Gallery cleared', ['listing_id' => $listing->id]);
            }
        } else {
            \Log::info('🎨 No gallery_image_ids in request', ['listing_id' => $listing->id]);
        }

        if (is_array($submissionPayload)) {
            $listing->update(['submission_payload' => $submissionPayload]);
            $this->syncSubmissionPayloadRelations($listing, $submissionPayload);
        }

        ActivityLogger::log('listing.updated', $listing, [
            'old' => $old,
            'new' => $listing->fresh()?->only(array_keys($validated)),
        ], $request);

        return response()->json($listing->load(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name', 'mediaFiles']));
    }

    public function destroy(Request $request, Listing $listing)
    {
        ActivityLogger::log('listing.deleted', $listing, [
            'old' => $listing->only(['title', 'status', 'submission_source']),
        ], $request);

        $listing->delete();
        return response()->noContent();
    }

    public function approve(Request $request, Listing $listing)
    {
        $oldStatus = $listing->status;

        $listing->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        ActivityLogger::log('listing.approved', $listing, [
            'old' => ['status' => $oldStatus],
            'new' => ['status' => 'approved'],
        ], $request);

        return response()->json(['message' => 'Listing approved']);
    }

    public function reject(Request $request, Listing $listing)
    {
        $oldStatus = $listing->status;
        $listing->update(['status' => 'rejected']);

        ActivityLogger::log('listing.rejected', $listing, [
            'old' => ['status' => $oldStatus],
            'new' => ['status' => 'rejected'],
        ], $request);

        return response()->json(['message' => 'Listing rejected']);
    }

    public function publish(Request $request, Listing $listing)
    {
        $oldStatus = $listing->status;

        $listing->update([
            'status' => 'published',
            'published_at' => $listing->published_at ?? now(),
        ]);

        ActivityLogger::log('listing.published', $listing, [
            'old' => ['status' => $oldStatus],
            'new' => ['status' => 'published'],
        ], $request);

        return response()->json(['message' => 'Listing published']);
    }

    private function syncSubmissionPayloadRelations(Listing $listing, array $payload): void
    {
        if (!empty($payload['category_names']) && is_array($payload['category_names'])) {
            $categoryIds = Category::query()
                ->where('type', 'listing')
                ->whereIn('name', $payload['category_names'])
                ->pluck('id')
                ->all();

            if ($categoryIds) {
                $listing->categories()->sync($categoryIds);
            }
        }

        if (array_key_exists('facilities', $payload) && is_array($payload['facilities'])) {
            $listing->facilities()->delete();
            foreach ($payload['facilities'] as $index => $facility) {
                if (!is_string($facility) || trim($facility) === '') {
                    continue;
                }

                $listing->facilities()->create([
                    'name' => trim($facility),
                    'sort_order' => $index,
                ]);
            }
        }

        $imageUrls = $this->submissionImageUrls($payload);
        if ($imageUrls) {
            $listing->images()->delete();
            foreach ($imageUrls as $index => $url) {
                $listing->images()->create([
                    'path' => $url,
                    'alt_text' => $listing->title,
                    'sort_order' => $index,
                    'is_featured' => $index === 0,
                ]);
            }
        }
    }

    private function submissionImageUrls(array $payload): array
    {
        $urls = [];
        foreach (['featured_image', 'thumbnail_image'] as $key) {
            if (!empty($payload[$key]) && is_string($payload[$key])) {
                $urls[] = trim($payload[$key]);
            }
        }

        if (!empty($payload['gallery_images']) && is_string($payload['gallery_images'])) {
            foreach (preg_split('/[\r\n,]+/', $payload['gallery_images']) ?: [] as $url) {
                $url = trim($url);
                if ($url !== '') {
                    $urls[] = $url;
                }
            }
        }

        return array_values(array_unique($urls));
    }

    private function syncGalleryImages(Listing $listing, string $galleryImages): void
    {
        $imageUrls = [];
        foreach (preg_split('/[\r\n]+/', $galleryImages) ?: [] as $url) {
            $url = trim($url);
            if ($url !== '') {
                $imageUrls[] = $url;
            }
        }

        if ($imageUrls) {
            // Get existing image paths to preserve them
            $existingPaths = $listing->images()->pluck('path')->toArray();

            // Only delete images that are not in the new list
            $pathsToDelete = array_diff($existingPaths, $imageUrls);
            if (!empty($pathsToDelete)) {
                $listing->images()->whereIn('path', $pathsToDelete)->delete();
            }

            // Add new images that don't already exist
            foreach ($imageUrls as $index => $url) {
                if (!in_array($url, $existingPaths)) {
                    $listing->images()->create([
                        'path' => $url,
                        'alt_text' => $listing->title,
                        'sort_order' => $index,
                        'is_featured' => $index === 0,
                    ]);
                }
            }

            // Update sort_order for all images to maintain order
            foreach ($imageUrls as $index => $url) {
                $listing->images()->where('path', $url)->update([
                    'sort_order' => $index,
                    'is_featured' => $index === 0,
                ]);
            }
        } else {
            // If no images provided, delete all existing images only if explicitly clearing
            $listing->images()->delete();
        }
    }
}
