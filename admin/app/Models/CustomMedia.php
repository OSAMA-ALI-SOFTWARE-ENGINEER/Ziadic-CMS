<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $file_name
 * @property string $stored_name
 * @property string $file_path
 * @property string|null $mime_type
 * @property string|null $file_type
 * @property int|null $file_size
 * @property string|null $extension
 * @property string|null $alt_text
 * @property string|null $title
 * @property string|null $caption
 * @property int|null $uploaded_by
 * @property string|null $related_module
 * @property int|null $related_entity_id
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 */
class CustomMedia extends Model
{
    use SoftDeletes;

    protected $table = 'custom_media';

    protected $fillable = [
        'file_name',
        'stored_name',
        'file_path',
        'mime_type',
        'file_type',
        'file_size',
        'extension',
        'alt_text',
        'title',
        'caption',
        'uploaded_by',
        'related_module',
        'related_entity_id',
        'status',
    ];

    protected $appends = ['public_url'];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function linkedListings(): BelongsToMany
    {
        return $this->belongsToMany(Listing::class, 'media_listing')
            ->withPivot('type', 'sort_order');
    }

    public function getPublicUrlAttribute(): string
    {
        if (str_starts_with($this->file_path, 'http')) {
            return $this->file_path;
        }
        // file_path already includes 'storage/', so just prepend domain
        if (str_starts_with($this->file_path, 'storage/')) {
            return url($this->file_path);
        }
        // Fallback for paths without storage prefix
        return url("storage/{$this->file_path}");
    }

    public function isImage(): bool
    {
        return in_array($this->file_type, ['image', 'jpg', 'png', 'gif', 'webp', 'svg']);
    }

    public function isDocument(): bool
    {
        return in_array($this->file_type, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt']);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeImages($query)
    {
        return $query->where('file_type', 'image');
    }

    public function scopeByModule($query, $module)
    {
        return $query->where('related_module', $module);
    }
}
