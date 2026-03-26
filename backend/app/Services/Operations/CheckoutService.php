<?php

namespace App\Services\Operations;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Inventory;
use App\Models\Restaurant;
use App\Models\UserAddress;
use App\Models\Coupon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;

class CheckoutService
{
    /**
     * Complete the checkout process in a single atomic transaction.
     * Follows the 'ACID Path' with stock reservation and data snapshotting.
     */
    public function process(array $data, $user)
    {
        return DB::transaction(function () use ($data, $user) {
            // 1. Resolve Global Entities
            $restaurant = Restaurant::findOrFail($data['restaurant_id']);
            $address = UserAddress::find($data['address_id']);
            
            // 2. Initial Calculations
            $subtotal = 0;
            $itemsData = [];
            
            // 3. Process Items & Lock Inventory
            foreach ($data['items'] as $item) {
                // Precise locking to prevent race conditions during checkout
                $inventory = Inventory::where('product_variant_id', $item['product_variant_id'])
                    ->where('restaurant_id', $restaurant->id)
                    ->lockForUpdate()
                    ->first();

                if (!$inventory || ($inventory->stock - $inventory->reserved_stock) < $item['quantity']) {
                    throw new \Exception("Item '{$item['product_name']}' is out of stock in required quantity.");
                }

                $itemSubtotal = $item['unit_price'] * $item['quantity'];
                $subtotal += $itemSubtotal;

                // Snapshot item data
                $itemsData[] = [
                    'product_id' => $item['product_id'],
                    'product_variant_id' => $item['product_variant_id'],
                    'product_name' => $item['product_name'],
                    'variant_name' => $item['variant_name'],
                    'image_url' => $item['image_url'] ?? null,
                    'mrp_price' => $item['mrp_price'] ?? $item['unit_price'],
                    'unit_price' => $item['unit_price'],
                    'quantity' => $item['quantity'],
                    'total_price' => $itemSubtotal,
                ];

                // Increment Reserved Stock
                $inventory->increment('reserved_stock', $item['quantity']);
            }

            // 4. Resolve Fees & Discounts
            $deliveryFee = $data['delivery_fee'] ?? 0;
            $packingCharge = $data['packing_charge'] ?? 0;
            $platformFee = $data['platform_fee'] ?? 0;
            $taxAmount = $data['tax_amount'] ?? ($subtotal * 0.05); // Default 5% GST
            
            $discountAmount = 0;
            if (isset($data['coupon_code'])) {
                $coupon = Coupon::where('code', $data['coupon_code'])->active()->first();
                if ($coupon && $subtotal >= $coupon->min_order_amount) {
                    $discountAmount = $coupon->type === 'percentage' 
                        ? ($subtotal * $coupon->value / 100) 
                        : $coupon->value;
                }
            }

            $totalAmount = ($subtotal + $deliveryFee + $packingCharge + $platformFee + $taxAmount) - $discountAmount;

            // 5. Create Order Header
            $order = Order::create([
                'order_number' => 'ORD-' . strtoupper(Str::random(10)),
                'idempotency_key' => $data['idempotency_key'] ?? Str::uuid(),
                'user_id' => $user->id,
                'restaurant_id' => $restaurant->id,
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'delivery_fee' => $deliveryFee,
                'packing_charge' => $packingCharge,
                'platform_fee' => $platformFee,
                'discount_amount' => $discountAmount,
                'total_amount' => $totalAmount,
                'currency' => 'INR',
                'address_id' => $address?->id,
                'address' => $address ? "{$address->address_line}, {$address->landmark}, {$address->city}" : 'Pickup',
                'payment_method' => $data['payment_method'] ?? 'online',
                'payment_status' => 'pending',
                'status' => 'placed',
                'order_type' => $address ? 'delivery' : 'pickup',
                'payment_expires_at' => Carbon::now()->addMinutes(15),
                'total_items' => count($itemsData),
                'total_quantity' => collect($itemsData)->sum('quantity'),
                'notes' => $data['notes'] ?? null,
            ]);

            // 6. Bulk Create Items
            foreach ($itemsData as &$itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
            }

            // 7. Initialize Log
            $order->logs()->create([
                'status' => 'placed',
                'notes' => 'Checkout finalized. Awaiting payment.',
                'changed_by_type' => 'user',
                'changed_by_id' => $user->id
            ]);

            return $order;
        });
    }
}
