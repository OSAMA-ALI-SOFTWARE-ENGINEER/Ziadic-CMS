<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class ListingImage extends Model
{
    protected $fillable = ['listing_id', 'media_id', 'path', 'alt_text', 'caption', 'sort_order', 'is_featured'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean'];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function media(): BelongsTo
    {
        return $this->belongsTo(Media::class);
    }
}
