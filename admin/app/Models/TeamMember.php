<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class TeamMember extends Model implements HasMedia
{
    use InteractsWithMedia;
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'designation',
        'bio',
        'email',
        'phone',
        'social_links',
        'sort_order',
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
        return [
            'social_links' => 'array',
            'is_active' => 'boolean',
        ];
    }
}
