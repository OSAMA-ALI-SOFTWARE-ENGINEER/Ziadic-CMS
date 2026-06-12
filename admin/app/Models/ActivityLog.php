<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        // new schema
        'action',
        'old_value',
        'new_value',
        // legacy schema
        'event',
        'properties',
        'subject_type',
        'subject_id',
        'user_agent',
        // common
        'user_id',
        'user_name',
        'user_role',
        'related_id',
        'related_type',
        'ip_address',
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
    ];

    // Optional relations
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function related()
    {
        return $this->morphTo(null, 'related_type', 'related_id');
    }
}
