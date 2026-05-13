<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingContact extends Model
{
    protected $fillable = ['listing_id', 'type', 'label', 'value', 'sort_order'];

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }
}
