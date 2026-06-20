<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Creates pivot table linking custom media files to listings.
     * Uses BIGINT UNSIGNED for all foreign keys to match parent tables.
     */
    public function up(): void
    {
        Schema::create('media_listing', function (Blueprint $table) {
            $table->id();

            // Foreign keys - both use BIGINT UNSIGNED (matches $table->id() in parent tables)
            $table->unsignedBigInteger('media_id');
            $table->unsignedBigInteger('listing_id');

            // Media type categorization
            $table->enum('type', ['thumbnail', 'gallery', 'featured'])->default('gallery');
            $table->unsignedInteger('sort_order')->default(0)->index();

            // Timestamps
            $table->timestamps();

            // Constraints - reference custom_media and listings tables
            $table->foreign('media_id')
                ->references('id')
                ->on('custom_media')
                ->cascadeOnDelete();

            $table->foreign('listing_id')
                ->references('id')
                ->on('listings')
                ->cascadeOnDelete();

            // Indexes and unique constraint
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
