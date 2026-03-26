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
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('current_latitude', 10, 8)->nullable();
            $table->decimal('current_longitude', 11, 8)->nullable();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->string('order_type')->default('delivery'); // delivery, pickup
            $table->integer('rider_id')->nullable();
            $table->timestamp('estimated_delivery_time')->nullable();
            $table->timestamp('actual_delivery_time')->nullable();
            // Upgrading status to support more states if needed, though usually just string is fine
            // We'll keep it as string for now but documented in the model
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['current_latitude', 'current_longitude']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['order_type', 'rider_id', 'estimated_delivery_time', 'actual_delivery_time']);
        });
    }
};
