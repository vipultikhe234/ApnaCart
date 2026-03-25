<?php

namespace App\Http\Controllers;

use App\Models\Restaurant;
use Illuminate\Http\Request;

class RestaurantController extends Controller
{
    /**
     * Get the merchant's restaurant profile.
     */
    public function show(Request $request)
    {
        $restaurant = $request->user()->restaurant()->with('merchant')->first();
        
        if (!$restaurant) {
            return response()->json(['message' => 'No restaurant node found for this merchant identity.'], 404);
        }

        return response()->json(['data' => $restaurant]);
    }

    /**
     * Update the restaurant profile.
     */
    public function update(Request $request)
    {
        $restaurant = $request->user()->restaurant;

        if (!$restaurant) {
            return response()->json(['message' => 'No restaurant context identified.'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'address' => 'sometimes|string',
            'image' => 'sometimes|string',
            'is_open' => 'sometimes|boolean',
            'opening_time' => 'sometimes|string',
            'closing_time' => 'sometimes|string',
        ]);

        $restaurant->update($validated);

        return response()->json([
            'message' => 'Restaurant synchronization successful.',
            'data'    => $restaurant
        ]);
    }

    /**
     * Store a newly created merchant and restaurant (Super Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'merchant_name' => 'required|string|max:255',
            'email'         => 'required|email|unique:users,email',
            'password'      => 'required|string|min:6',
            'restaurant_name' => 'required|string|max:255',
            'address'       => 'required|string',
            'image'         => 'nullable|string',
            'opening_time'  => 'nullable|string',
            'closing_time'  => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated) {
            // 1. Create the user
            $user = \App\Models\User::create([
                'name'     => $validated['merchant_name'],
                'email'    => $validated['email'],
                'password' => \Hash::make($validated['password']),
                'role'     => 'merchant',
            ]);

            // 2. Create the restaurant
            $restaurant = Restaurant::create([
                'merchant_id'  => $user->id,
                'name'         => $validated['restaurant_name'],
                'address'      => $validated['address'],
                'image'        => $validated['image'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                'opening_time' => $validated['opening_time'] ?? '09:00:00',
                'closing_time' => $validated['closing_time'] ?? '22:00:00',
                'is_open'      => true,
            ]);

            return response()->json([
                'message'    => 'Merchant ecosystem provisioned successfully.',
                'restaurant' => $restaurant->load('merchant')
            ], 201);
        });
    }

    /**
     * Update an existing merchant and restaurant (Super Admin only).
     */
    public function adminUpdate(Request $request, $id)
    {
        $restaurant = Restaurant::findOrFail($id);
        
        $validated = $request->validate([
            'merchant_name'   => 'sometimes|string|max:255',
            'email'           => 'sometimes|email|unique:users,email,' . $restaurant->merchant_id,
            'password'        => 'sometimes|nullable|string|min:6',
            'restaurant_name' => 'sometimes|string|max:255',
            'address'         => 'sometimes|string',
            'image'           => 'nullable|string',
            'opening_time'    => 'nullable|string',
            'closing_time'    => 'nullable|string',
        ]);

        return \DB::transaction(function () use ($validated, $restaurant) {
            // Update User
            $userData = [];
            if (isset($validated['merchant_name'])) $userData['name'] = $validated['merchant_name'];
            if (isset($validated['email'])) $userData['email'] = $validated['email'];
            if (!empty($validated['password'])) $userData['password'] = \Hash::make($validated['password']);
            
            if (!empty($userData)) {
                $restaurant->merchant->update($userData);
            }

            // Update Restaurant
            $restData = [];
            if (isset($validated['restaurant_name'])) $restData['name'] = $validated['restaurant_name'];
            if (isset($validated['address'])) $restData['address'] = $validated['address'];
            if (isset($validated['image'])) $restData['image'] = $validated['image'];
            if (isset($validated['opening_time'])) $restData['opening_time'] = $validated['opening_time'];
            if (isset($validated['closing_time'])) $restData['closing_time'] = $validated['closing_time'];
            
            $restaurant->update($restData);

            return response()->json([
                'message'    => 'Merchant ecosystem updated successfully.',
                'restaurant' => $restaurant->load('merchant')
            ]);
        });
    }

    /**
     * List all restaurants (Super Admin only).
     */
    public function listAll()
    {
        return response()->json(['data' => Restaurant::with('merchant')->latest()->get()]);
    }

    /**
     * Toggle restaurant active status (Super Admin).
     */
    public function toggleStatus($id)
    {
        $restaurant = Restaurant::findOrFail($id);
        $restaurant->is_active = !$restaurant->is_active;
        $restaurant->save();

        return response()->json([
            'message'   => 'Node status toggled successfully.',
            'is_active' => $restaurant->is_active
        ]);
    }
}
