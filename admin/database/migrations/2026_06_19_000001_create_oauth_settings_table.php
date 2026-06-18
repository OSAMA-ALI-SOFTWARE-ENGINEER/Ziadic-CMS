<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('oauth_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('oauth_enabled')->default(false);

            // Google OAuth
            $table->string('google_client_id')->nullable();
            $table->string('google_client_secret')->nullable();
            $table->string('google_redirect_uri')->default('https://admin.kukaqka.com/auth/callback/google');

            // Facebook OAuth
            $table->string('facebook_app_id')->nullable();
            $table->string('facebook_app_secret')->nullable();
            $table->string('facebook_redirect_uri')->default('https://admin.kukaqka.com/auth/callback/facebook');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('oauth_settings');
    }
};
