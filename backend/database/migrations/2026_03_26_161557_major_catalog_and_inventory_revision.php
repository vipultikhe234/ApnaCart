<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Refine the products table for variant support
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('has_variants')->default(false)->after('description');
            $table->boolean('is_active')->default(true)->after('stock');
            $table->softDeletes();
            
            // Note: We keep existing price/stock for backward compatibility 
            // during migration, but future logic will use product_variants.
        });

        // 2. Create the product_variants table (The sellable SKUs)
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('name')->nullable(); // e.g. "Pack of 2"
            $table->string('quantity')->nullable(); // e.g. "500g", "1kg", "500ml"
            $table->decimal('mrp_price', 10, 2)->nullable(); // Original price
            $table->decimal('price', 10, 2); // Selling price
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            
            // Prevent duplicate variants for same product with same quantity unit
            $table->unique(['product_id', 'quantity'], 'unique_variant_per_product');
        });

        // 3. Create the inventories table (Decoupled Stock Logic)
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('restaurant_id')->constrained()->cascadeOnDelete(); // Map to our existing restaurant/shop concept
            $table->integer('stock')->default(0);
            $table->integer('reserved_stock')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
            
            // Indexing for high-speed stock checks & cross-store lookups
            $table->index(['product_variant_id', 'restaurant_id']);
        });

        // 4. Create cart_items table
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
            $table->integer('quantity')->default(1);
            $table->timestamps();
            
            $table->index(['user_id', 'product_variant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('inventories');
        Schema::dropIfExists('product_variants');
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['has_variants', 'is_active']);
            $table->dropSoftDeletes();
        });
    }
};
