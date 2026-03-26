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
        // 1. Add coordinates to restaurants (merchants)
        Schema::table('restaurants', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('address');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });

        // 2. Add coordinates to user addresses (customers)
        Schema::table('user_addresses', function (Blueprint $table) {
            $table->decimal('latitude', 10, 8)->nullable()->after('address_line');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });

        // 3. Add coordinates to orders (for snapshot)
        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('user_lat', 10, 8)->nullable()->after('address');
            $table->decimal('user_lng', 11, 8)->nullable()->after('user_lat');
            $table->decimal('distance_km', 8, 2)->nullable()->after('user_lng');
        });

        // 4. Add per-km charge and max distance to merchant_other_charges
        Schema::table('merchant_other_charges', function (Blueprint $table) {
            $table->enum('delivery_charge_type', ['fixed', 'distance'])->default('fixed')->after('merchant_id');
            $table->decimal('delivery_charge_per_km', 10, 2)->default(0.00)->after('delivery_charge');
            $table->decimal('max_delivery_distance', 8, 1)->default(10.0)->after('delivery_charge_per_km'); // Default 10km radius
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('merchant_other_charges', function (Blueprint $table) {
            $table->dropColumn(['delivery_charge_type', 'delivery_charge_per_km', 'max_delivery_distance']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['user_lat', 'user_lng', 'distance_km']);
        });

        Schema::table('user_addresses', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });

        Schema::table('restaurants', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude']);
        });
    }
};
