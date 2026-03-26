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
        // 1. Refactor the orders table for financial snapshots and high-scale tracking
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'order_number')) $table->string('order_number')->unique()->after('id');
            if (!Schema::hasColumn('orders', 'idempotency_key')) $table->string('idempotency_key')->nullable()->unique()->after('order_number');
            if (!Schema::hasColumn('orders', 'currency')) $table->string('currency', 3)->default('INR')->after('idempotency_key');
            
            if (!Schema::hasColumn('orders', 'subtotal_amount')) $table->decimal('subtotal_amount', 10, 2)->default(0)->after('updated_at');
            if (!Schema::hasColumn('orders', 'tax_amount')) $table->decimal('tax_amount', 10, 2)->default(0)->after('subtotal_amount');
            if (!Schema::hasColumn('orders', 'delivery_fee')) $table->decimal('delivery_fee', 10, 2)->default(0)->after('tax_amount');
            if (!Schema::hasColumn('orders', 'packing_charge')) $table->decimal('packing_charge', 10, 2)->default(0)->after('delivery_fee');
            if (!Schema::hasColumn('orders', 'platform_fee')) $table->decimal('platform_fee', 10, 2)->default(0)->after('packing_charge');
            
            if (!Schema::hasColumn('orders', 'payment_method')) $table->string('payment_method')->nullable()->after('payment_status');
            if (!Schema::hasColumn('orders', 'payment_expires_at')) $table->timestamp('payment_expires_at')->nullable()->after('payment_status');
            
            if (!Schema::hasColumn('orders', 'total_items')) $table->integer('total_items')->default(0)->after('updated_at');
            if (!Schema::hasColumn('orders', 'total_quantity')) $table->integer('total_quantity')->default(0)->after('total_items');
            
            if (!Schema::hasColumn('orders', 'notes')) $table->text('notes')->nullable()->after('updated_at');
            if (!Schema::hasColumn('orders', 'cancellation_reason')) $table->text('cancellation_reason')->nullable()->after('notes');
            
            if (!Schema::hasColumn('orders', 'placed_at')) $table->timestamp('placed_at')->nullable()->after('created_at');
            if (!Schema::hasColumn('orders', 'delivered_at')) $table->timestamp('delivered_at')->nullable()->after('placed_at');
            if (!Schema::hasColumn('orders', 'cancelled_at')) $table->timestamp('cancelled_at')->nullable()->after('delivered_at');
        });

        // 2. Refine order_items for full snapshotting
        Schema::table('order_items', function (Blueprint $table) {
            if (!Schema::hasColumn('order_items', 'product_id')) $table->foreignId('product_id')->nullable()->after('order_id');
            if (!Schema::hasColumn('order_items', 'product_variant_id')) $table->foreignId('product_variant_id')->nullable()->after('product_id');
            if (!Schema::hasColumn('order_items', 'product_name')) $table->string('product_name')->nullable()->after('product_variant_id');
            if (!Schema::hasColumn('order_items', 'variant_name')) $table->string('variant_name')->nullable()->after('product_name');
            if (!Schema::hasColumn('order_items', 'image_url')) $table->string('image_url')->nullable()->after('variant_name');
            if (!Schema::hasColumn('order_items', 'mrp_price')) $table->decimal('mrp_price', 10, 2)->nullable()->after('image_url');
            if (!Schema::hasColumn('order_items', 'unit_price')) $table->decimal('unit_price', 10, 2)->nullable(); // No after to be safe
            if (!Schema::hasColumn('order_items', 'tax_amount')) $table->decimal('tax_amount', 10, 2)->default(0);
            if (!Schema::hasColumn('order_items', 'discount_amount')) $table->decimal('discount_amount', 10, 2)->default(0);
            if (!Schema::hasColumn('order_items', 'fulfilled_quantity')) $table->integer('fulfilled_quantity')->default(0);
        });

        // 3. Create the order_status_logs table (The Audit Trail)
        if (!Schema::hasTable('order_status_logs')) {
            Schema::create('order_status_logs', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->cascadeOnDelete();
                $table->string('status');
                $table->text('notes')->nullable();
                $table->string('changed_by_type')->nullable(); // user, admin, rider, system
                $table->unsignedBigInteger('changed_by_id')->nullable(); 
                $table->timestamps();
                
                $table->index(['order_id', 'status']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['product_id', 'product_variant_id', 'product_name', 'variant_name', 'image_url', 'mrp_price', 'unit_price', 'tax_amount', 'discount_amount', 'fulfilled_quantity']);
        });
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_number', 'idempotency_key', 'currency', 'subtotal_amount', 'tax_amount', 'delivery_fee', 'packing_charge', 'platform_fee', 'payment_method', 'payment_expires_at', 'total_items', 'total_quantity', 'notes', 'cancellation_reason', 'placed_at', 'delivered_at', 'cancelled_at']);
            $table->dropSoftDeletes();
        });
    }
};
