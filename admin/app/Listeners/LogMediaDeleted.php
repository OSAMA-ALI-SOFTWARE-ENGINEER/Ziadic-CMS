<?php

namespace App\Listeners;

use App\Events\MediaDeleted;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogMediaDeleted
{
    public function handle(MediaDeleted $event): void
    {
        try {
            $eventType = $event->count > 1 ? 'media.bulk_deleted' : 'media.deleted';
            ActivityLog::create([
                'user_id' => Auth::id(),
                'event' => $eventType,
                'subject_type' => 'App\Models\CustomMedia',
                'subject_id' => $event->media->id,
                'properties' => json_encode([
                    'file_name' => $event->media->file_name,
                    'count' => $event->count,
                ]),
            ]);
        } catch (\Throwable $e) {
            \Log::error('Failed to log media deletion: ' . $e->getMessage());
        }
    }
}
