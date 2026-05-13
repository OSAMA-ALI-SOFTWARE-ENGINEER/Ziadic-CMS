<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingHour extends Model
{
    protected $fillable = ['listing_id', 'day_of_week', 'opens_at', 'closes_at', 'is_closed'];

    protected function casts(): array
    {
        return ['is_closed' => 'boolean'];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
