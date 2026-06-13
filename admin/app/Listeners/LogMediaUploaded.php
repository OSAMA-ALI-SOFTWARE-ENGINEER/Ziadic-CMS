<?php

namespace App\Listeners;

use App\Events\MediaUploaded;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogMediaUploaded
{
    public function handle(MediaUploaded $event): void
    {
        try {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'event' => 'media.uploaded',
                'subject_type' => 'App\Models\CustomMedia',
                'subject_id' => $event->media->id,
                'properties' => json_encode([
                    'file_name' => $event->media->file_name,
                    'file_type' => $event->media->file_type,
                    'file_size' => $event->media->file_size,
                ]),
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to log media upload: ' . $e->getMessage());
        }
    }
}
