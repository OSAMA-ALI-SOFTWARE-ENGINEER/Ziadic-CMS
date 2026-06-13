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
        Schema::create('media_listing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('media_id')->constrained('custom_media')->cascadeOnDelete();
            $table->foreignId('listing_id')->constrained('listings')->cascadeOnDelete();
            $table->enum('type', ['thumbnail', 'gallery', 'featured'])->default('gallery');
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['listing_id', 'media_id', 'type']);
            $table->index(['listing_id', 'type']);
            $table->index(['media_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_listing');
    }
};
