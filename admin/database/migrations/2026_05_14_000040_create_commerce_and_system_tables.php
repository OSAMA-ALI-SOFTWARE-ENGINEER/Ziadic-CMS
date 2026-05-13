<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->char('currency', 3)->default('USD');
            $table->string('billing_cycle', 32)->default('one_time')->index();
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained()->cascadeOnDelete();
            $table->string('status', 32)->default('active')->index();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable()->index();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('listing_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider', 32)->index();
            $table->string('provider_reference')->nullable()->index();
            $table->decimal('amount', 10, 2);
            $table->char('currency', 3)->default('USD');
            $table->string('status', 32)->default('pending')->index();
            $table->timestamp('paid_at')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::create('settings', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general')->index();
            $table->string('key');
            $table->json('value')->nullable();
            $table->string('type', 32)->default('string');
            $table->boolean('is_public')->default(false)->index();
            $table->timestamps();
            $table->unique(['group', 'key']);
        });

        Schema::create('contact_messages', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email')->index();
            $table->string('phone')->nullable();
            $table->string('subject')->nullable();
            $table->longText('message');
            $table->string('status', 32)->default('new')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('subject');
            $table->string('event')->index();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('contact_messages');
        Schema::dropIfExists('settings');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('subscriptions');
        Schema::dropIfExists('plans');
    }
};
