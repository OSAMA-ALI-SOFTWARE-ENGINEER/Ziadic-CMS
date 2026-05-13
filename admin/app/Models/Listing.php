<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Listing extends Model implements HasMedia
{
    use InteractsWithMedia;
    use Searchable;
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'city_id',
        'title',
        'slug',
        'excerpt',
        'description',
        'business_name',
        'email',
        'phone',
        'website_url',
        'address',
        'latitude',
        'longitude',
        'status',
        'is_featured',
        'published_at',
        'approved_by',
        'approved_at',
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
        return [
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ListingImage::class);
    }

    public function hours(): HasMany
    {
        return $this->hasMany(ListingHour::class);
    }

    public function facilities(): HasMany
    {
        return $this->hasMany(ListingFacility::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(ListingContact::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(ListingApproval::class);
    }

    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'business_name' => $this->business_name,
            'excerpt' => $this->excerpt,
            'description' => $this->description,
            'status' => $this->status,
            'city_id' => $this->city_id,
        ];
    }
}
