<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;
use App\Models\Restaurant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RestaurantController extends Controller
{
    /**
     * List all active restaurants (Public API).
     */
    public function index(Request $request)
    {
        $query = Restaurant::with(['city.state.country'])
            ->where('is_active', true);

        if ($request->has('city_id')) {
            $query->where('city_id', $request->city_id);
        }

        return response()->json(['data' => $query->latest()->get()]);
    }

    /**
     * Get a public restaurant profile (Public API).
     */
    public function showPublic($id)
    {
        $restaurant = Restaurant::with(['city.state.country'])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json(['data' => $restaurant]);
    }

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
            'name'          => 'nullable|string|max:255',
            'description'   => 'nullable|string',
            'address'       => 'nullable|string',
            'country_id'    => 'nullable|numeric',
            'state_id'      => 'nullable|numeric',
            'city_id'       => 'nullable|numeric',
            'image'         => 'nullable|string',
            'is_open'       => 'nullable',
            'opening_time'  => 'nullable|string',
            'closing_time'  => 'nullable|string',
        ]);

        // Convert is_open to boolean if it's 0/1 or string "true"/"false"
        if (isset($validated['is_open'])) {
            $validated['is_open'] = filter_var($validated['is_open'], FILTER_VALIDATE_BOOLEAN);
        }

        $restaurant->update($validated);

        return response()->json([
            'message' => 'Merchant profile synchronized successfully.',
            'data'    => $restaurant->load(['city.state.country'])
        ]);
    }

    /**
     * Store a newly created merchant and restaurant (Super Admin only).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'merchant_name'   => 'required|string|max:255',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|string|min:6',
            'restaurant_name' => 'required|string|max:255',
            'address'         => 'required|string',
            'country_id'      => 'nullable|exists:countries,id',
            'state_id'        => 'nullable|exists:states,id',
            'city_id'         => 'nullable|exists:cities,id',
            'image'           => 'nullable|string',
            'opening_time'    => 'nullable|string',
            'closing_time'    => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. Create the user
            $user = User::create([
                'name'     => $validated['merchant_name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'merchant',
            ]);

            // 2. Create the restaurant node
            $restaurant = Restaurant::create([
                'merchant_id'  => $user->id,
                'name'         => $validated['restaurant_name'],
                'address'      => $validated['address'],
                'country_id'   => $validated['country_id'] ?? null,
                'state_id'     => $validated['state_id'] ?? null,
                'city_id'      => $validated['city_id'] ?? null,
                'image'        => $validated['image'] ?? 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
                'opening_time' => $validated['opening_time'] ?? '09:00:00',
                'closing_time' => $validated['closing_time'] ?? '22:00:00',
                'is_open'      => true,
            ]);

            return response()->json([
                'message'    => 'Merchant ecosystem provisioned successfully.',
                'restaurant' => $restaurant->load(['merchant', 'city.state.country'])
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
            'country_id'      => 'nullable|exists:countries,id',
            'state_id'        => 'nullable|exists:states,id',
            'city_id'         => 'nullable|exists:cities,id',
            'image'           => 'nullable|string',
            'opening_time'    => 'nullable|string',
            'closing_time'    => 'nullable|string',
        ]);

        return DB::transaction(function () use ($validated, $restaurant) {
            // Update User
            $userData = [];
            if (isset($validated['merchant_name'])) $userData['name'] = $validated['merchant_name'];
            if (isset($validated['email'])) $userData['email'] = $validated['email'];
            if (!empty($validated['password'])) $userData['password'] = Hash::make($validated['password']);
            
            if (!empty($userData)) {
                $restaurant->merchant->update($userData);
            }

            // Update Merchant Node
            $restData = [];
            if (isset($validated['restaurant_name'])) $restData['name'] = $validated['restaurant_name'];
            if (isset($validated['address'])) $restData['address'] = $validated['address'];
            if (array_key_exists('country_id', $validated)) $restData['country_id'] = $validated['country_id'];
            if (array_key_exists('state_id', $validated)) $restData['state_id'] = $validated['state_id'];
            if (array_key_exists('city_id', $validated)) $restData['city_id'] = $validated['city_id'];
            if (isset($validated['image'])) $restData['image'] = $validated['image'];
            if (isset($validated['opening_time'])) $restData['opening_time'] = $validated['opening_time'];
            if (isset($validated['closing_time'])) $restData['closing_time'] = $validated['closing_time'];
            
            $restaurant->update($restData);

            return response()->json([
                'message'    => 'Merchant ecosystem updated successfully.',
                'restaurant' => $restaurant->load(['merchant', 'city.state.country'])
            ]);
        });
    }

    /**
     * List all restaurants (Super Admin only).
     */
    public function listAll()
    {
        return response()->json(['data' => Restaurant::with(['merchant', 'city.state.country'])->latest()->get()]);
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
