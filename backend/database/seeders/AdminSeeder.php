<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Admin (Universal Root)
        User::updateOrCreate(
            ['email' => 'admin@foodhub.com'],
            [
                'name' => 'FoodHub Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '0000000000',
                'address' => 'HQ, Pune'
            ]
        );

        // Merchant (Primary Node)
        User::updateOrCreate(
            ['email' => 'merchant@foodhub.com'],
            [
                'name' => 'FoodHub Merchant',
                'password' => Hash::make('password123'),
                'role' => 'merchant',
                'phone' => '1234567890',
                'address' => 'Shop 01, Pune'
            ]
        );

        // Admin (Legacy Compatibility)
        User::updateOrCreate(
            ['email' => 'admin@apnacart.com'],
            [
                'name' => 'ApnaCart Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        // Regular User
        User::updateOrCreate(
            ['email' => 'user@apnacart.com'],
            [
                'name' => 'Jane Customer',
                'password' => Hash::make('password123'),
                'role' => 'customer',
            ]
        );

        // Rider
        User::updateOrCreate(
            ['email' => 'rider@apnacart.com'],
            [
                'name' => 'Swift Courier',
                'password' => Hash::make('password123'),
                'role' => 'rider',
                'current_latitude' => 28.6139,
                'current_longitude' => 77.2090
            ]
        );
    }
}
