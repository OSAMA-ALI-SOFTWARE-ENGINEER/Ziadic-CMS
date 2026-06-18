<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OAuthSetting extends Model
{
    protected $table = 'oauth_settings';

    protected $fillable = [
        'oauth_enabled',
        'google_client_id',
        'google_client_secret',
        'google_redirect_uri',
        'facebook_app_id',
        'facebook_app_secret',
        'facebook_redirect_uri',
    ];

    protected $casts = [
        'oauth_enabled' => 'boolean',
    ];

    protected $hidden = [
        'google_client_secret',
        'facebook_app_secret',
    ];
}
