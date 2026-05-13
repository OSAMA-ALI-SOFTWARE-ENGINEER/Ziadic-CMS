<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingFacility extends Model
{
    protected $fillable = ['listing_id', 'name', 'icon', 'sort_order'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
