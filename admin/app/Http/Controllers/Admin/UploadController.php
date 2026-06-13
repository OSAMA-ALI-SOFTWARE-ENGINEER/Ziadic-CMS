<?php

namespace App\Http\Controllers\Admin;

use App\Events\MediaUploaded;
use App\Http\Controllers\Controller;
use App\Models\CustomMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:10240',
            'related_module' => 'nullable|string',
            'related_entity_id' => 'nullable|integer',
        ]);

        $file = $request->file('file');
        $storedPath = $file->store('uploads', 'public');

        // Get file info
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();
        $extension = $file->getClientOriginalExtension();
        $originalName = $file->getClientOriginalName();
        $storedName = basename($storedPath);

        // Determine file type
        $fileType = $this->determineFileType($mimeType, $extension);

        // Create media record
        $media = CustomMedia::create([
            'file_name' => $originalName,
            'stored_name' => $storedName,
            'file_path' => 'storage/' . $storedPath,
            'mime_type' => $mimeType,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'extension' => $extension,
            'uploaded_by' => Auth::id(),
            'related_module' => $request->input('related_module'),
            'related_entity_id' => $request->input('related_entity_id'),
            'status' => 'active',
        ]);

        MediaUploaded::dispatch($media);

        return response()->json([
            'id' => $media->id,
            'path' => $media->file_path,
            'url' => $media->public_url,
            'public_url' => $media->public_url,
            'file_name' => $media->file_name,
            'file_type' => $media->file_type,
        ], 201);
    }

    private function determineFileType($mimeType, $extension): string
    {
        if (str_starts_with($mimeType, 'image/')) {
            return 'image';
        }
        if (str_starts_with($mimeType, 'video/')) {
            return 'video';
        }
        if (str_starts_with($mimeType, 'audio/')) {
            return 'audio';
        }
        if ($mimeType === 'application/pdf' || $extension === 'pdf') {
            return 'pdf';
        }
        if (str_starts_with($mimeType, 'application/')) {
            return 'document';
        }
        return 'file';
    }
}
