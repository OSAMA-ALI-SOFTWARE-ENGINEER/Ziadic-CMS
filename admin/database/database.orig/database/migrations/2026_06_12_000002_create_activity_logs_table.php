<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->nullable();
            $table->string('user_role')->nullable();
            $table->unsignedBigInteger('related_id')->nullable();
            $table->string('related_type')->nullable();
            $table->json('old_value')->nullable();
            $table->json('new_value')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('activity_logs');
    }
};
