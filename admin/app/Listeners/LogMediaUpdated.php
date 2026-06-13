<?php

namespace App\Listeners;

use App\Events\MediaUpdated;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogMediaUpdated
{
    public function handle(MediaUpdated $event): void
    {
        try {
            ActivityLog::create([
                'user_id' => Auth::id(),
                'event' => 'media.updated',
                'subject_type' => 'App\Models\CustomMedia',
                'subject_id' => $event->media->id,
                'properties' => json_encode(array_merge(
                    ['file_name' => $event->media->file_name],
                    $event->changes
                )),
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to log media update: ' . $e->getMessage());
        }
    }
}
