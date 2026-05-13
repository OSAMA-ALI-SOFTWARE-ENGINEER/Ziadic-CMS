<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class City extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'country_id',
        'name',
        'slug',
        'state_region',
        'code',
        'description',
        'is_active',
        'seo_title',
        'seo_description',
        'seo_keywords',
        'canonical_url',
        'og_title',
        'og_description',
        'og_image',
        'robots',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class);
    }
}
