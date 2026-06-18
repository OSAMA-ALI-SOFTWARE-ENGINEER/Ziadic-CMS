<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->id();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('public_url')->nullable();
            $table->string('mime_type');
            $table->enum('file_type', ['image', 'document', 'video', 'audio', 'other'])->default('other');
            $table->unsignedBigInteger('file_size');
            $table->text('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->text('caption')->nullable();
            $table->enum('status', ['active', 'archived'])->default('active');
            $table->timestamps();
            $table->index('file_type');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
