<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            // Location fields
            $table->string('contact_phone')->nullable()->after('phone');
            $table->string('contact_email')->nullable()->after('contact_phone');
            $table->string('contact_website')->nullable()->after('contact_email');
            $table->text('contact_address')->nullable()->after('contact_website');

            // Schedule fields
            $table->string('open_days')->nullable()->after('contact_address'); // e.g., "Monday - Saturday"
            $table->time('open_time')->nullable()->after('open_days');
            $table->time('close_time')->nullable()->after('open_time');
            $table->string('weekend_text')->nullable()->after('close_time'); // e.g., "Weekend: Sunday"

            // Details section
            $table->string('details_heading')->nullable()->after('weekend_text');
            $table->longText('details_items')->nullable()->after('details_heading'); // JSON array

            // Facilities section
            $table->string('facilities_heading')->nullable()->after('details_items');
            // facilities table already has relationship, no need for column

            // Gallery section
            $table->string('gallery_heading')->nullable()->after('facilities_heading');
            $table->string('thumbnail_image')->nullable()->after('gallery_heading'); // Thumbnail image path
            // images table already has relationship, no need for column
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropColumn([
                'contact_phone',
                'contact_email',
                'contact_website',
                'contact_address',
                'open_days',
                'open_time',
                'close_time',
                'weekend_text',
                'details_heading',
                'details_items',
                'facilities_heading',
                'gallery_heading',
                'thumbnail_image',
            ]);
        });
    }
};
