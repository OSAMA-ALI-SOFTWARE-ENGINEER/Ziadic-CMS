<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ListingApproval extends Model
{
    protected $fillable = ['listing_id', 'submitted_by', 'reviewed_by', 'status', 'notes', 'reviewed_at'];

    protected function casts(): array
    {
        return ['reviewed_at' => 'datetime'];
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
