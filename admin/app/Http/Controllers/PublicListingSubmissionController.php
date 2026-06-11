<?php

namespace App\Http\Controllers;

use App\Models\ListingSubmission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicListingSubmissionController
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'description' => 'required|string|max:5000',
            'category_id' => 'required|integer|exists:categories,id',
            'city_id' => 'required|integer|exists:cities,id',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'website' => 'nullable|url|max:255',
            'image' => 'required|image|mimes:jpeg,png,gif,webp|max:5120',
        ]);

        $imagePath = null;

        try {
            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $filename = Str::slug($validated['title']) . '-' . time() . '.' . $file->getClientOriginalExtension();
                $imagePath = $file->storeAs('submissions', $filename, 'public');
            }

            $submission = ListingSubmission::create([
                'title' => $validated['title'],
                'business_name' => $validated['business_name'],
                'description' => $validated['description'],
                'category_id' => $validated['category_id'],
                'city_id' => $validated['city_id'],
                'contact_name' => $validated['contact_name'],
                'contact_email' => $validated['contact_email'],
                'contact_phone' => $validated['contact_phone'],
                'website' => $validated['website'],
                'image_path' => $imagePath,
                'status' => 'pending',
            ]);

            return response()->json([
                'message' => 'Listing submitted successfully. Our team will review it shortly.',
                'submission_id' => $submission->id,
            ], 201);
        } catch (\Exception $e) {
            // Clean up uploaded file if database insert fails
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            return response()->json([
                'message' => 'Failed to submit listing. Please try again later.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
