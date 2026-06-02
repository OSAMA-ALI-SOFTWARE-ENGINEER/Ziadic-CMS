<?php

namespace App\Http\Controllers\Admin;

use App\Models\Listing;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ListingController
{
    public function index(Request $request)
    {
        $query = Listing::with(['city:id,name', 'categories:id,name', 'owner:id,name'])
            ->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->status);
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
            'website_url' => 'nullable|url',
            'status' => 'in:draft,pending,published|default:draft',
            'is_featured' => 'boolean',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $userId = $request->user()?->getAuthIdentifier();
        abort_unless($userId, 401);

        $validated['owner_id'] = $userId;
        $validated['slug'] = $validated['slug'] ?? str($validated['title'])->slug();

        $listing = Listing::create($validated);

        if (!empty($validated['categories'])) {
            $listing->categories()->sync($validated['categories']);
        }

        return response()->json($listing->load(['city:id,name', 'categories:id,name']), 201);
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
            'website_url' => 'nullable|url',
            'status' => 'in:draft,pending,published',
            'is_featured' => 'boolean',
            'categories' => 'nullable|array',
            'categories.*' => 'exists:categories,id',
            'seo_title' => 'nullable|string',
            'seo_description' => 'nullable|string',
            'seo_keywords' => 'nullable|string',
        ]);

        $listing->update($validated);

        if (isset($validated['categories'])) {
            $listing->categories()->sync($validated['categories']);
        }

        return response()->json($listing->load(['city:id,name', 'categories:id,name']));
    }

    public function destroy(Listing $listing)
    {
        $listing->delete();
        return response()->noContent();
    }

    public function approve(Listing $listing)
    {
        $listing->update([
            'status' => 'published',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'published_at' => $listing->published_at ?? now(),
        ]);

        return response()->json(['message' => 'Listing approved']);
    }

    public function reject(Request $request, Listing $listing)
    {
        $listing->update(['status' => 'draft']);
        return response()->json(['message' => 'Listing rejected']);
    }

    public function publish(Listing $listing)
    {
        $listing->update([
            'status' => 'published',
            'published_at' => $listing->published_at ?? now(),
        ]);

        return response()->json(['message' => 'Listing published']);
    }
}
