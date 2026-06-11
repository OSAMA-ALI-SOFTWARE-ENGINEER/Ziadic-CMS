<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Media;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        $query = Media::query()
            ->where('model_type', '=', 'App\\Models\\Media')
            ->orderByDesc('created_at');

        if ($request->string('search')->isNotEmpty()) {
            $search = $request->string('search')->toString();
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        if ($request->string('type')->isNotEmpty()) {
            $type = $request->string('type')->toString();
            $query->where(function ($q) use ($type) {
                match ($type) {
                    'image' => $q->where('mime_type', 'like', 'image/%'),
                    'video' => $q->where('mime_type', 'like', 'video/%'),
                    'audio' => $q->where('mime_type', 'like', 'audio/%'),
                    'document' => $q->whereIn('mime_type', [
                        'application/pdf',
                        'application/msword',
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    ]),
                    default => true,
                };
            });
        }

        return $query->paginate(20)->through(fn(Media $media) => [
            'id' => $media->id,
            'uuid' => $media->uuid,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'type' => $media->type,
            'extension' => $media->extension,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'formatted_size' => $media->formatted_size,
            'url' => $media->url,
            'created_at' => $media->created_at,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:102400', // 100MB per file
        ]);

        $uploaded = [];

        foreach ($request->file('files', []) as $file) {
            try {
                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('media', $filename, 'public');

                $media = Media::create([
                    'uuid' => Str::uuid(),
                    'model_type' => 'App\\Models\\Media',
                    'model_id' => 0,
                    'collection_name' => 'default',
                    'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                    'file_name' => $path,
                    'mime_type' => $file->getMimeType(),
                    'disk' => 'public',
                    'size' => $file->getSize(),
                    'custom_properties' => [],
                ]);

                $uploaded[] = [
                    'id' => $media->id,
                    'uuid' => $media->uuid,
                    'name' => $media->name,
                    'file_name' => $media->file_name,
                    'type' => $media->type,
                    'extension' => $media->extension,
                    'mime_type' => $media->mime_type,
                    'size' => $media->size,
                    'formatted_size' => $media->formatted_size,
                    'url' => $media->url,
                ];
            } catch (\Exception $e) {
                \Log::error('Media upload failed', ['error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => count($uploaded) . ' file(s) uploaded successfully',
            'uploaded' => $uploaded,
        ], 201);
    }

    public function show(Media $media)
    {
        return [
            'id' => $media->id,
            'uuid' => $media->uuid,
            'name' => $media->name,
            'file_name' => $media->file_name,
            'type' => $media->type,
            'extension' => $media->extension,
            'mime_type' => $media->mime_type,
            'size' => $media->size,
            'formatted_size' => $media->formatted_size,
            'url' => $media->url,
            'created_at' => $media->created_at,
            'updated_at' => $media->updated_at,
        ];
    }

    public function update(Request $request, Media $media)
    {
        $request->validate([
            'name' => 'string|max:255',
        ]);

        if ($request->filled('name')) {
            $media->update(['name' => $request->string('name')]);
        }

        return response()->json([
            'message' => 'Media updated successfully',
            'media' => $this->show($media),
        ]);
    }

    public function destroy(Media $media)
    {
        try {
            Storage::disk($media->disk)->delete($media->file_name);
            $media->delete();

            return response()->json([
                'message' => 'Media deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete media',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:media,id',
        ]);

        $deleted = 0;
        foreach ($request->input('ids', []) as $id) {
            try {
                $media = Media::find($id);
                if ($media) {
                    Storage::disk($media->disk)->delete($media->file_name);
                    $media->delete();
                    $deleted++;
                }
            } catch (\Exception $e) {
                \Log::error('Bulk delete failed', ['id' => $id, 'error' => $e->getMessage()]);
            }
        }

        return response()->json([
            'message' => "$deleted file(s) deleted successfully",
            'deleted' => $deleted,
        ]);
    }
}
