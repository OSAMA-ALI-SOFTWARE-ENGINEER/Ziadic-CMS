<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ListingSubmission;
use Illuminate\Http\Request;

class ApprovedListingController extends Controller
{
    public function index()
    {
        // Get approved listings - SIMPLE AND DIRECT
        $listings = ListingSubmission::where('status', 'approved')
            ->with(['category', 'city', 'reviewer'])
            ->orderBy('reviewed_at', 'desc')
            ->get();

        return response()->json([
            'data' => $listings,
            'count' => $listings->count(),
        ]);
    }

    public function show(ListingSubmission $listing)
    {
        if ($listing->status !== 'approved') {
            return response()->json([
                'message' => 'Listing not found or is not approved.',
            ], 404);
        }

        return response()->json([
            'data' => $listing->load(['category', 'city', 'reviewer']),
        ]);
    }

    public function update(Request $request, ListingSubmission $listing)
    {
        if ($listing->status !== 'approved') {
            return response()->json([
                'message' => 'Only approved listings can be edited.',
            ], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
            'category_id' => 'nullable|integer|exists:categories,id',
            'city_id' => 'nullable|integer|exists:cities,id',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
        ]);

        $listing->update($validated);

        return response()->json([
            'message' => 'Listing updated successfully.',
            'data' => $listing->load(['category', 'city', 'reviewer']),
        ]);
    }

    public function delete(ListingSubmission $listing)
    {
        if ($listing->status !== 'approved') {
            return response()->json([
                'message' => 'Only approved listings can be deleted.',
            ], 403);
        }

        $listing->delete();

        return response()->json([
            'message' => 'Listing deleted successfully.',
        ]);
    }

    public function publish(ListingSubmission $listing)
    {
        if ($listing->status !== 'approved') {
            return response()->json([
                'message' => 'Only approved listings can be published.',
            ], 400);
        }

        // Validate required fields
        if (!$listing->title || !$listing->description || !$listing->contact_email) {
            return response()->json([
                'message' => 'Missing required fields for publication.',
            ], 400);
        }

        try {
            // Create published listing
            $listing->update([
                'status' => 'published',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            return response()->json([
                'message' => 'Listing published successfully.',
                'data' => $listing->load(['category', 'city', 'reviewer']),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to publish listing: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function approve(ListingSubmission $listing)
    {
        if ($listing->status === 'approved') {
            return response()->json([
                'message' => 'Listing is already approved.',
            ], 400);
        }

        $listing->approve();

        return response()->json([
            'message' => 'Listing approved successfully.',
            'data' => $listing->load(['category', 'city', 'reviewer']),
        ]);
    }

    public function reject(Request $request, ListingSubmission $listing)
    {
        if ($listing->status === 'approved') {
            return response()->json([
                'message' => 'Cannot reject an already approved listing.',
            ], 400);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:1000',
        ]);

        $listing->reject($validated['reason']);

        return response()->json([
            'message' => 'Listing rejected successfully.',
            'data' => $listing->load(['category', 'city', 'reviewer']),
        ]);
    }

    public function getCountByStatus($status)
    {
        $count = ListingSubmission::where('status', $status)->count();

        return response()->json([
            'status' => $status,
            'count' => $count,
        ]);
    }
}
