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
        $query = Restaurant::with(['city.state.country', 'otherCharges'])
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
        $restaurant = Restaurant::with(['city.state.country', 'otherCharges'])
            ->where('is_active', true)
            ->findOrFail($id);

        return response()->json(['data' => $restaurant]);
    }

    /**
     * Get the merchant's restaurant profile.
     */
    public function show(Request $request)
    {
        $restaurant = $request->user()->restaurant()->with(['merchant', 'otherCharges'])->first();
        
        if (!$restaurant) {
            return response()->json(['message' => 'No merchant node found for this identity.'], 404);
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
            'name'                  => 'nullable|string|max:255',
            'description'           => 'nullable|string',
            'address'               => 'nullable|string',
            'country_id'            => 'nullable|numeric',
            'state_id'              => 'nullable|numeric',
            'city_id'               => 'nullable|numeric',
            'image'                 => 'nullable|string',
            'is_open'               => 'nullable',
            'opening_time'          => 'nullable|string',
            'closing_time'          => 'nullable|string',
            'delivery_charge'       => 'nullable|numeric',
            'packaging_charge'      => 'nullable|numeric',
            'platform_fee'          => 'nullable|numeric',
            'delivery_charge_tax'   => 'nullable|numeric',
            'packaging_charge_tax'  => 'nullable|numeric',
            'platform_fee_tax'      => 'nullable|numeric',
            'latitude'              => 'nullable|numeric',
            'longitude'             => 'nullable|numeric',
            'delivery_charge_type'  => 'nullable|in:fixed,distance',
            'delivery_charge_per_km'=> 'nullable|numeric',
            'max_delivery_distance' => 'nullable|numeric',
        ]);

        // Convert is_open to boolean
        if (isset($validated['is_open'])) {
            $validated['is_open'] = filter_var($validated['is_open'], FILTER_VALIDATE_BOOLEAN);
        }

        DB::transaction(function () use ($restaurant, $validated, $request) {
            $restaurant->update($validated);

            // Update or Create charges
            $chargeData = $request->only([
                'delivery_charge', 'packaging_charge', 'platform_fee',
                'delivery_charge_tax', 'packaging_charge_tax', 'platform_fee_tax',
                'delivery_charge_type', 'delivery_charge_per_km', 'max_delivery_distance'
            ]);

            if (!empty($chargeData)) {
                $restaurant->otherCharges()->updateOrCreate(
                    ['merchant_id' => $restaurant->id],
                    $chargeData
                );
            }
        });

        return response()->json([
            'message' => 'Merchant profile synchronized successfully.',
            'data'    => $restaurant->load(['city.state.country', 'otherCharges'])
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
            'delivery_charge'       => 'nullable|numeric',
            'packaging_charge'      => 'nullable|numeric',
            'platform_fee'          => 'nullable|numeric',
            'delivery_charge_tax'   => 'nullable|numeric',
            'packaging_charge_tax'  => 'nullable|numeric',
            'platform_fee_tax'      => 'nullable|numeric',
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

            // 3. Create initial charges
            $restaurant->otherCharges()->create([
                'delivery_charge'       => $validated['delivery_charge'] ?? 20.00,
                'packaging_charge'      => $validated['packaging_charge'] ?? 10.00,
                'platform_fee'          => $validated['platform_fee'] ?? 5.00,
                'delivery_charge_tax'   => $validated['delivery_charge_tax'] ?? 5.0,
                'packaging_charge_tax'  => $validated['packaging_charge_tax'] ?? 18.0,
                'platform_fee_tax'      => $validated['platform_fee_tax'] ?? 18.0,
            ]);

            return response()->json([
                'message'    => 'Merchant ecosystem provisioned successfully.',
                'restaurant' => $restaurant->load(['merchant', 'city.state.country', 'otherCharges'])
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
            'delivery_charge'       => 'nullable|numeric',
            'packaging_charge'      => 'nullable|numeric',
            'platform_fee'          => 'nullable|numeric',
            'delivery_charge_tax'   => 'nullable|numeric',
            'packaging_charge_tax'  => 'nullable|numeric',
            'platform_fee_tax'      => 'nullable|numeric',
            'latitude'              => 'nullable|numeric',
            'longitude'             => 'nullable|numeric',
            'delivery_charge_type'  => 'nullable|in:fixed,distance',
            'delivery_charge_per_km'=> 'nullable|numeric',
            'max_delivery_distance' => 'nullable|numeric',
        ]);

        return DB::transaction(function () use ($validated, $restaurant, $request) {
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
            if (isset($validated['latitude'])) $restData['latitude'] = $validated['latitude'];
            if (isset($validated['longitude'])) $restData['longitude'] = $validated['longitude'];
            
            $restaurant->update($restData);

            // Update Charges
            $chargeData = $request->only([
                'delivery_charge', 'packaging_charge', 'platform_fee',
                'delivery_charge_tax', 'packaging_charge_tax', 'platform_fee_tax',
                'delivery_charge_type', 'delivery_charge_per_km', 'max_delivery_distance'
            ]);

            if (!empty($chargeData)) {
                $restaurant->otherCharges()->updateOrCreate(
                    ['merchant_id' => $restaurant->id],
                    $chargeData
                );
            }

            return response()->json([
                'message'    => 'Merchant ecosystem updated successfully.',
                'restaurant' => $restaurant->load(['merchant', 'city.state.country', 'otherCharges'])
            ]);
        });
    }

    /**
     * List all restaurants (Super Admin only).
     */
    public function listAll()
    {
        return response()->json(['data' => Restaurant::with(['merchant', 'city.state.country', 'otherCharges'])->latest()->get()]);
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
