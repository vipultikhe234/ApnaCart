<?php

namespace Database\Seeders;

use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RestaurantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Create a Merchant User
        $merchant = User::updateOrCreate(
            ['email' => 'merchant@apnacart.com'],
            [
                'name' => 'John Merchant',
                'password' => Hash::make('password123'),
                'role' => 'merchant',
                'phone' => '1234567890'
            ]
        );

        // 2. Create a Restaurant for that merchant
        Restaurant::create([
            'merchant_id' => $merchant->id,
            'name' => 'The Grand Burger',
            'description' => 'Best burgers in town with a family secret recipe.',
            'address' => '123 Foodie St, Flavor Town',
            'is_open' => true,
            'opening_time' => '09:00:00',
            'closing_time' => '22:00:00',
        ]);
    }
}
