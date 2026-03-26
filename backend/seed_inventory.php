<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Inventory;
use App\Models\Restaurant;

echo "Seeding Inventories...\n";

$restaurants = Restaurant::all();
$products = Product::all();

foreach ($products as $product) {
    // 1. Ensure product has at least one variant if it doesn't have any
    if ($product->variants()->count() === 0) {
        $product->variants()->create([
            'name' => 'Standard',
            'mrp_price' => $product->price + 50,
            'price' => $product->price,
            'is_active' => true,
        ]);
    }

    $variants = $product->variants;
    foreach ($variants as $variant) {
        // Find if this product belongs to a restaurant (it should)
        $restId = $product->restaurant_id ?: (Restaurant::first()->id ?? 1);
        
        Inventory::updateOrCreate(
            ['product_variant_id' => $variant->id, 'restaurant_id' => $restId],
            ['stock' => 100, 'reserved_stock' => 0, 'is_available' => true]
        );
    }
}

echo "Inventories Seeded Successfully.\n";
