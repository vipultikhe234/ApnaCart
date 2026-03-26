<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

use App\Models\User;
use App\Models\Restaurant;
use App\Models\MerchantOtherCharge;

$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = User::where('email', 'merchant@foodhub.com')->first();
if ($user) {
    echo "Found user: " . $user->name . "\n";
    $rest = Restaurant::updateOrCreate(
        ['merchant_id' => $user->id],
        [
            'name' => 'FoodHub Merchant Outlet',
            'address' => 'Pune Main Road',
            'is_open' => true,
            'is_active' => true,
            'image' => 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'
        ]
    );
    echo "Rest/Merchant ID: " . $rest->id . "\n";
    
    MerchantOtherCharge::updateOrCreate(
        ['merchant_id' => $rest->id],
        [
            'delivery_charge' => 20.00,
            'packaging_charge' => 10.00,
            'platform_fee' => 5.00,
            'delivery_charge_tax' => 5.0,
            'packaging_charge_tax' => 18.0,
            'platform_fee_tax' => 18.0
        ]
    );
    echo "Other charges provisioned.\n";
} else {
    echo "User not found.\n";
}
