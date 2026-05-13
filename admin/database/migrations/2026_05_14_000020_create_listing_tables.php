<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('city_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->string('business_name')->nullable()->index();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('website_url')->nullable();
            $table->string('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('status', 32)->default('draft')->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('robots', 64)->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'city_id']);
            $table->index(['status', 'published_at']);
        });

        Schema::create('listing_category', function (Blueprint $table): void {
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->primary(['listing_id', 'category_id']);
        });

        Schema::create('listing_tag', function (Blueprint $table): void {
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['listing_id', 'tag_id']);
        });

        Schema::create('listing_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('path')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('listing_hours', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week');
            $table->time('opens_at')->nullable();
            $table->time('closes_at')->nullable();
            $table->boolean('is_closed')->default(false);
            $table->timestamps();
            $table->unique(['listing_id', 'day_of_week']);
        });

        Schema::create('listing_facilities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('listing_contacts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->string('type', 32)->index();
            $table->string('label')->nullable();
            $table->string('value');
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamps();
        });

        Schema::create('listing_approvals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('listing_id')->constrained()->cascadeOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status', 32)->default('pending')->index();
            $table->text('notes')->nullable();
            $table->timestamp('reviewed_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listing_approvals');
        Schema::dropIfExists('listing_contacts');
        Schema::dropIfExists('listing_facilities');
        Schema::dropIfExists('listing_hours');
        Schema::dropIfExists('listing_images');
        Schema::dropIfExists('listing_tag');
        Schema::dropIfExists('listing_category');
        Schema::dropIfExists('listings');
    }
};
