<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    use HasFactory;

    protected $table = 'activity_logs';

    protected $fillable = [
        'action','user_id','user_name','user_role','related_id','related_type','old_value','new_value','ip_address'
    ];

    protected $casts = [
        'old_value' => 'array',
        'new_value' => 'array',
    ];
}
