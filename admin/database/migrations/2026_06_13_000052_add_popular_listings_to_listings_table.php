<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->boolean('is_popular')->default(false)->after('is_featured')->index();
            $table->unsignedInteger('popular_order')->default(0)->after('is_popular')->index();
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex(['is_popular']);
            $table->dropIndex(['popular_order']);
            $table->dropColumn(['is_popular', 'popular_order']);
        });
    }
};
