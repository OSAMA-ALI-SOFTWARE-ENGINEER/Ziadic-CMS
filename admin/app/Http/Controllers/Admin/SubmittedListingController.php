<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingSubmission;
use App\Support\ActivityLogger;
use Illuminate\Http\Request;

class SubmittedListingController extends Controller
{
    public function index(Request $request)
    {
        // Show ALL submissions (pending, approved, published, rejected)
        $query = ListingSubmission::query();

        // Search by title or business name
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('business_name', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        $list = $query->latest()->paginate(20);

        return response()->json($list);
    }

    public function show($id)
    {
        $submission = ListingSubmission::findOrFail($id);
        return response()->json($submission);
    }

    public function update(Request $request, $id)
    {
        $submission = ListingSubmission::findOrFail($id);
        $old = $submission->toArray();

        $data = $request->only(['title','business_name','description','category_id','city_id','contact_name','contact_email','contact_phone','website']);
        $submission->update($data);

        ActivityLogger::log('listing.updated', $submission, [
            'old' => $old,
            'new' => $submission->toArray(),
        ], $request);

        return response()->json($submission);
    }

    public function approve($id)
    {
        $submission = ListingSubmission::findOrFail($id);
        $submission->approve();

        ActivityLogger::log('listing.approved', $submission, [], request());

        return response()->json([
            'message' => 'Submission approved successfully.',
            'data' => $submission->load(['category', 'city', 'reviewer']),
        ]);
    }

    public function reject(Request $request, $id)
    {
        $submission = ListingSubmission::findOrFail($id);
        $reason = $request->string('reason')->toString();
        $submission->reject($reason);

        ActivityLogger::log('listing.rejected', $submission, [
            'old' => null,
            'new' => ['rejection_reason' => $reason],
        ], $request);

        return response()->json(['message' => 'Submission rejected.']);
    }

    public function publish($id)
    {
        $submission = ListingSubmission::findOrFail($id);

        try {
            // Create listing from submission
            $listing = Listing::create([
                'title' => $submission->title,
                'slug' => \Illuminate\Support\Str::slug($submission->title . '-' . uniqid()),
                'description' => $submission->description,
                'business_name' => $submission->business_name,
                'email' => $submission->contact_email,
                'phone' => $submission->contact_phone,
                'website_url' => $submission->website,
                'city_id' => $submission->city_id,
                'status' => 'published',
                'published_at' => now(),
                'approved_at' => now(),
                'approved_by' => auth()->id(),
            ]);

            // Attach category if exists
            if ($submission->category_id) {
                $listing->categories()->attach($submission->category_id);
            }

            // Mark submission as published
            $submission->update([
                'status' => 'published',
                'reviewed_by' => auth()->id(),
                'reviewed_at' => now(),
            ]);

            ActivityLogger::log('listing.published', $submission, ['listing_id' => $listing->id], request());

            return response()->json([
                'message' => 'Submission published successfully!',
                'listing_id' => $listing->id,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to publish: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function destroy($id)
    {
        $submission = ListingSubmission::findOrFail($id);
        $submission->delete();

        ActivityLogger::log('listing.deleted', $submission, [], request());

        return response()->json(['message' => 'Submission deleted.']);
    }
}
