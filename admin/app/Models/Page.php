<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Page extends Model implements HasMedia
{
    use InteractsWithMedia;
    use SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'template',
        'content',
        'status',
        'published_at',
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
            'content' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
