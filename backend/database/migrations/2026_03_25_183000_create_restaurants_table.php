<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('address')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_open')->default(true);
            $table->time('opening_time')->nullable();
            $table->time('closing_time')->nullable();
            $table->decimal('rating', 3, 2)->default(0.00);
            $table->timestamps();
        });

        // Add restaurant_id to products
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
        });

        // Add restaurant_id to categories (to allow merchant-specific categories)
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('id')->constrained()->nullOnDelete();
        });

        // Add restaurant_id to orders
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('restaurant_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('restaurant_id');
        });
        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('restaurant_id');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('restaurant_id');
        });
        Schema::dropIfExists('restaurants');
    }
};
