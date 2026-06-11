<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Listing;
use App\Models\ListingSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ListingSubmissionController extends Controller
{
    public function index(Request $request)
    {
        $query = ListingSubmission::query()
            ->with(['category:id,name', 'city.country:id,name,iso2', 'reviewer:id,name'])
            ->orderByDesc('created_at');

        if ($request->string('status')->isNotEmpty()) {
            $query->where('status', $request->string('status'));
        }

        if ($request->string('search')->isNotEmpty()) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('business_name', 'like', "%{$search}%")
                    ->orWhere('contact_email', 'like', "%{$search}%");
            });
        }

        return $query->paginate(15)->through(fn(ListingSubmission $submission) => [
            'id' => $submission->id,
            'title' => $submission->title,
            'business_name' => $submission->business_name,
            'category' => $submission->category?->name,
            'city' => $submission->city?->name,
            'contact_email' => $submission->contact_email,
            'status' => $submission->status,
            'created_at' => $submission->created_at,
            'reviewed_at' => $submission->reviewed_at,
        ]);
    }

    public function show(ListingSubmission $submission)
    {
        $submission->load(['category:id,name', 'city.country:id,name,iso2', 'reviewer:id,name,email']);

        return [
            'id' => $submission->id,
            'title' => $submission->title,
            'business_name' => $submission->business_name,
            'description' => $submission->description,
            'category_id' => $submission->category_id,
            'category' => $submission->category?->name,
            'city_id' => $submission->city_id,
            'city' => $submission->city?->name,
            'contact_name' => $submission->contact_name,
            'contact_email' => $submission->contact_email,
            'contact_phone' => $submission->contact_phone,
            'website' => $submission->website,
            'image_path' => $submission->image_path,
            'image_url' => $submission->image_path ? Storage::disk('public')->url($submission->image_path) : null,
            'status' => $submission->status,
            'rejection_reason' => $submission->rejection_reason,
            'reviewer' => $submission->reviewer ? [
                'id' => $submission->reviewer->id,
                'name' => $submission->reviewer->name,
                'email' => $submission->reviewer->email,
            ] : null,
            'reviewed_at' => $submission->reviewed_at,
            'created_at' => $submission->created_at,
            'updated_at' => $submission->updated_at,
        ];
    }

    public function approve(ListingSubmission $submission)
    {
        $submission->approve();

        // TODO: Optionally auto-create listing from submission
        // This would convert the submission into an actual Listing

        return response()->json([
            'message' => 'Submission approved successfully.',
            'submission' => $this->show($submission),
        ]);
    }

    public function reject(Request $request, ListingSubmission $submission)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $submission->reject($validated['rejection_reason']);

        return response()->json([
            'message' => 'Submission rejected.',
            'submission' => $this->show($submission),
        ]);
    }

    public function destroy(ListingSubmission $submission)
    {
        // Delete associated image
        if ($submission->image_path) {
            Storage::disk('public')->delete($submission->image_path);
        }

        $submission->forceDelete();

        return response()->json([
            'message' => 'Submission deleted successfully.',
        ]);
    }
}
