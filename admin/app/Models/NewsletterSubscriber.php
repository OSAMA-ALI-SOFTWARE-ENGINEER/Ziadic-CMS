<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $email
 * @property string $status
 * @property string $source
 * @property string|null $ip_address
 * @property string|null $user_agent
 * @property \Illuminate\Support\Carbon|null $subscribed_at
 * @property \Illuminate\Support\Carbon|null $confirmation_sent_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 */
class NewsletterSubscriber extends Model
{
    protected $fillable = [
        'email',
        'status',
        'source',
        'subscribed_at',
        'confirmation_sent_at',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'subscribed_at' => 'datetime',
            'confirmation_sent_at' => 'datetime',
        ];
    }
}
