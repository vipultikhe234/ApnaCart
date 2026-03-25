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
        if (!Schema::hasColumn('categories', 'restaurant_id')) {
            Schema::table('categories', function (Blueprint $table) {
                $table->foreignId('restaurant_id')->nullable()->constrained()->onDelete('cascade');
            });
        }

        if (!Schema::hasColumn('coupons', 'restaurant_id')) {
            Schema::table('coupons', function (Blueprint $table) {
                $table->foreignId('restaurant_id')->nullable()->constrained()->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });

        Schema::table('coupons', function (Blueprint $table) {
            $table->dropForeign(['restaurant_id']);
            $table->dropColumn('restaurant_id');
        });
    }
};
