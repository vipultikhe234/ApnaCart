<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@apnacart.com'],
            [
                'name' => 'ApnaCart Administrator',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'phone' => '0000000000',
                'address' => 'Main Office, FoodTown'
            ]
        );
        
        // Regular User
        User::updateOrCreate(
            ['email' => 'user@apnacart.com'],
            [
                'name' => 'Jane Customer',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'phone' => '1112223333',
                'address' => 'Customer Lane 45'
            ]
        );

        // Rider
        User::updateOrCreate(
            ['email' => 'rider@apnacart.com'],
            [
                'name' => 'Swift Courier',
                'password' => Hash::make('password123'),
                'role' => 'rider',
                'phone' => '5556667777',
                'address' => 'Express Terminal 01',
                'current_latitude' => 28.6139,
                'current_longitude' => 77.2090
            ]
        );
    }
}
