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
        Schema::create('merchant_other_charges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('merchant_id')->constrained('restaurants')->cascadeOnDelete();
            
            $table->decimal('delivery_charge', 10, 2)->default(0.00);
            $table->decimal('packaging_charge', 10, 2)->default(0.00);
            $table->decimal('platform_fee', 10, 2)->default(0.00);
            
            $table->decimal('delivery_charge_tax', 10, 2)->default(0.00); // Percentage
            $table->decimal('packaging_charge_tax', 10, 2)->default(0.00); // Percentage
            $table->decimal('platform_fee_tax', 10, 2)->default(0.00); // Percentage
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('merchant_other_charges');
    }
};
