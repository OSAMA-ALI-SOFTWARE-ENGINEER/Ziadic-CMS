<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Category;
use App\Models\City;
use App\Models\User;

/**
 * @property int $id
 * @property string $title
 * @property string|null $business_name
 * @property string $description
 * @property int|null $category_id
 * @property int|null $city_id
 * @property string $contact_name
 * @property string $contact_email
 * @property string|null $contact_phone
 * @property string|null $website
 * @property string|null $image_path
 * @property string $status
 * @property string|null $rejection_reason
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class ListingSubmission extends Model
{
    use SoftDeletes;

    protected $table = 'listing_submissions';

    protected $fillable = [
        'title',
        'business_name',
        'description',
        'category_id',
        'city_id',
        'contact_name',
        'contact_email',
        'contact_phone',
        'website',
        'image_path',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function approve(): void
    {
        $this->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);
    }

    public function reject(string $reason): void
    {
        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);
    }
}
