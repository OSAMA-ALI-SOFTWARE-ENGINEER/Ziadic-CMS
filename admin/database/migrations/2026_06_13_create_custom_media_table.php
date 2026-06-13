<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('custom_media', function (Blueprint $table) {
            $table->id();
            $table->string('file_name'); // Original uploaded filename
            $table->string('stored_name'); // Stored filename (hashed)
            $table->string('file_path'); // Relative path: storage/uploads/...
            $table->string('mime_type')->nullable();
            $table->string('file_type')->nullable(); // image, document, video, etc.
            $table->bigInteger('file_size')->nullable(); // bytes
            $table->string('extension')->nullable(); // jpg, pdf, etc.

            // Metadata
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->text('caption')->nullable();

            // Relations
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('related_module')->nullable(); // listing, blog, page, service
            $table->bigInteger('related_entity_id')->nullable(); // listing_id, blog_id, etc.

            // Status
            $table->string('status')->default('active'); // active, archived, deleted
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index(['uploaded_by']);
            $table->index(['related_module', 'related_entity_id']);
            $table->index(['file_type']);
            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_media');
    }
};
