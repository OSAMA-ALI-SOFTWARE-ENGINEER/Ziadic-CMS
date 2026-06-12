<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('submitted_listings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->nullable()->index();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->string('location')->nullable();
            $table->string('contact_name')->nullable();
            $table->string('contact_email')->nullable();
            $table->decimal('price', 12, 2)->nullable();
            $table->json('images')->nullable();
            $table->enum('status', ['pending_review','approved','rejected','published','draft'])->default('pending_review');
            $table->string('source')->default('frontend');
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('submitted_listings');
    }
};
