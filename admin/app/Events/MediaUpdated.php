<?php

namespace App\Events;

use App\Models\CustomMedia;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MediaUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public CustomMedia $media,
        public array $changes,
    ) {}
}
