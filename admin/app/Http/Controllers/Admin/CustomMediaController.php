<?php

namespace App\Http\Controllers\Admin;

use App\Events\MediaDeleted;
use App\Events\MediaUpdated;
use App\Http\Controllers\Controller;
use App\Models\CustomMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CustomMediaController extends Controller
{
    public function index(Request $request)
    {
        $query = CustomMedia::query()->active();

        // Search
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('file_name', 'like', "%{$search}%")
                  ->orWhere('alt_text', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Filter by type
        if ($request->has('file_type')) {
            $query->where('file_type', $request->input('file_type'));
        }

        // Filter by module
        if ($request->has('related_module')) {
            $query->byModule($request->input('related_module'));
        }

        // Sort
        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = (int) $request->input('per_page', 20);
        $paginated = $query->paginate($perPage);

        return response()->json($paginated);
    }

    public function show(CustomMedia $media)
    {
        return response()->json($media);
    }

    public function update(Request $request, CustomMedia $media)
    {
        $validated = $request->validate([
            'alt_text' => 'nullable|string',
            'title' => 'nullable|string',
            'caption' => 'nullable|string',
            'status' => 'nullable|string|in:active,archived,deleted',
        ]);

        $original = $media->getOriginal();
        $media->update($validated);

        MediaUpdated::dispatch($media, array_diff_assoc($validated, $original));

        return response()->json($media);
    }

    public function destroy(CustomMedia $media)
    {
        // Delete from storage
        $storagePath = str_replace('storage/', '', $media->file_path);
        if (Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
        }

        // Soft delete from database
        $media->delete();

        MediaDeleted::dispatch($media, 1);

        return response()->json(['message' => 'Media deleted'], 200);
    }

    public function bulkDelete(Request $request)
    {
        $ids = $request->input('ids', []);

        if (empty($ids)) {
            return response()->json(['message' => 'No IDs provided'], 422);
        }

        $media = CustomMedia::whereIn('id', $ids)->get();
        $count = count($media);

        foreach ($media as $item) {
            $storagePath = str_replace('storage/', '', $item->file_path);
            if (Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->delete($storagePath);
            }
            $item->delete();
        }

        MediaDeleted::dispatch($media->first() ?? new CustomMedia(), $count);

        return response()->json(['message' => $count . ' media items deleted'], 200);
    }
}
