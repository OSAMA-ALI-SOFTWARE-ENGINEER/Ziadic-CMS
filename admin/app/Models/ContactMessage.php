<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use SoftDeletes;

    protected $fillable = ['name', 'email', 'phone', 'subject', 'message', 'status', 'assigned_to'];

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
