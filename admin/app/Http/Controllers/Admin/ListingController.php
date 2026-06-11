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
        $query = Listing::with(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name'])
            ->orderByDesc('created_at');

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

        return response()->json(
            $query->paginate($perPage)
        );
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
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
            'submission_payload' => 'nullable|array',
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

        ActivityLogger::log('listing.created', $listing, [
            'new' => $listing->only(['title', 'status', 'submission_source']),
        ], $request);

        return response()->json($listing->load(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name']), 201);
    }

    public function show(Listing $listing)
    {
        return response()->json(
            $listing->load(['city:id,name', 'categories:id,name', 'owner:id,name', 'images', 'hours', 'facilities', 'contacts'])
        );
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
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
            'og_image' => 'nullable|string',
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

        if (is_array($submissionPayload)) {
            $listing->update(['submission_payload' => $submissionPayload]);
            $this->syncSubmissionPayloadRelations($listing, $submissionPayload);
        }

        ActivityLogger::log('listing.updated', $listing, [
            'old' => $old,
            'new' => $listing->fresh()?->only(array_keys($validated)),
        ], $request);

        return response()->json($listing->load(['city.country:id,name,iso2', 'categories:id,name,slug', 'owner:id,name']));
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
}
