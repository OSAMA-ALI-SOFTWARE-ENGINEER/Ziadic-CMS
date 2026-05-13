<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->char('iso2', 2)->nullable()->unique();
            $table->char('iso3', 3)->nullable()->unique();
            $table->string('phone_code', 16)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('cities', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('country_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('state_region')->nullable()->index();
            $table->string('code', 32)->nullable();
            $table->text('description')->nullable();
            $table->string('seo_title')->nullable();
            $table->text('seo_description')->nullable();
            $table->string('seo_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_title')->nullable();
            $table->text('og_description')->nullable();
            $table->string('og_image')->nullable();
            $table->string('robots', 64)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('type', 32)->default('listing')->index();
            $table->string('name');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
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
            $table->unique(['type', 'slug']);
        });

        Schema::create('tags', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('type', 32)->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tags');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('cities');
        Schema::dropIfExists('countries');
    }
};
