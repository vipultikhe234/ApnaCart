<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MerchantOtherChargesSeeder extends Seeder
{
    public function run(): void
    {
        $restaurants = \App\Models\Restaurant::all();
        
        foreach ($restaurants as $rest) {
            \App\Models\MerchantOtherCharge::updateOrCreate(
                ['merchant_id' => $rest->id],
                [
                    'delivery_charge' => 20.00,
                    'packaging_charge' => 10.00,
                    'platform_fee' => 5.00,
                    'delivery_charge_tax' => 5.0, // 5% GST
                    'packaging_charge_tax' => 18.0, // 18% GST
                    'platform_fee_tax' => 18.0, // 18% GST
                ]
            );
        }
    }
}
