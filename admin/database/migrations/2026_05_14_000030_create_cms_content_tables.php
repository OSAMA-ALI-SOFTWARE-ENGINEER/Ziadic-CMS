<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pages', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('template')->nullable()->index();
            $table->json('content')->nullable();
            $table->string('status', 32)->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index();
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
        });

        Schema::create('posts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('author_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content')->nullable();
            $table->string('status', 32)->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index();
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
            $table->index(['status', 'published_at']);
        });

        Schema::create('post_tag', function (Blueprint $table): void {
            $table->foreignId('post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
            $table->primary(['post_id', 'tag_id']);
        });

        Schema::create('services', function (Blueprint $table): void {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('description')->nullable();
            $table->string('status', 32)->default('draft')->index();
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->timestamp('published_at')->nullable()->index();
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
        });

        Schema::create('team_members', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('designation')->nullable();
            $table->longText('bio')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->json('social_links')->nullable();
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
        });

        Schema::create('faqs', function (Blueprint $table): void {
            $table->id();
            $table->nullableMorphs('faqable');
            $table->string('question');
            $table->longText('answer');
            $table->unsignedInteger('sort_order')->default(0)->index();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('services');
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('pages');
    }
};
