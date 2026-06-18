<?php

namespace App\Http\Controllers\Admin;

use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MediaController
{
    public function index(Request $request)
    {
        $query = Media::query();

        if ($request->has('search') && $request->search) {
            $query->where('file_name', 'like', "%{$request->search}%")
                  ->orWhere('alt_text', 'like', "%{$request->search}%");
        }

        if ($request->has('file_type') && $request->file_type) {
            $query->where('file_type', $request->file_type);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $sortBy = $request->input('sort_by', 'created_at');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = (int) $request->input('per_page', 20);
        $paginated = $query->paginate($perPage);

        return response()->json($paginated);
    }

    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
        ]);

        $file = $request->file('file');
        $fileName = time() . '_' . $file->getClientOriginalName();
        
        $path = $file->storeAs('media', $fileName, 'public');
        
        $mimeType = $file->getMimeType();
        $fileType = $this->getFileType($mimeType);

        $media = Media::create([
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'public_url' => asset('storage/' . $path),
            'mime_type' => $mimeType,
            'file_type' => $fileType,
            'file_size' => $file->getSize(),
            'alt_text' => $request->input('alt_text'),
            'title' => $request->input('title'),
            'caption' => $request->input('caption'),
            'status' => 'active',
        ]);

        return response()->json([
            'message' => 'File uploaded successfully',
            'data' => $media,
        ], 201);
    }

    public function show(Media $media)
    {
        return response()->json($media);
    }

    public function update(Request $request, Media $media)
    {
        $request->validate([
            'alt_text' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'caption' => 'nullable|string',
            'status' => 'nullable|in:active,archived',
        ]);

        $media->update($request->only(['alt_text', 'title', 'caption', 'status']));

        return response()->json([
            'message' => 'Media updated successfully',
            'data' => $media,
        ]);
    }

    public function destroy(Media $media)
    {
        if (Storage::disk('public')->exists($media->file_path)) {
            Storage::disk('public')->delete($media->file_path);
        }

        $media->delete();

        return response()->json([
            'message' => 'Media deleted successfully',
        ]);
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:media,id',
        ]);

        $media = Media::whereIn('id', $request->ids)->get();

        foreach ($media as $item) {
            if (Storage::disk('public')->exists($item->file_path)) {
                Storage::disk('public')->delete($item->file_path);
            }
            $item->delete();
        }

        return response()->json([
            'message' => 'Media deleted successfully',
        ]);
    }

    private function getFileType($mimeType): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        } elseif (str_starts_with($mimeType, 'video/')) {
            return 'video';
        } elseif (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        } elseif (in_array($mimeType, ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])) {
            return 'document';
        }

        return 'other';
    }
}
