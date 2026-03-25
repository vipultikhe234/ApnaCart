<?php

namespace App\Http\Controllers;

use App\Services\ProductService;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service,
        protected \App\Services\FCMService $fcmService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $role = $user?->role ?? 'guest';
        $targetId = $request->restaurant_id;

        // Logging for audit and debugging
        \Log::info("Admin-Scoping Trace", [
            'role' => $role,
            'target_merchant' => $targetId,
            'is_authenticated' => !!$user
        ]);

        // 1. Merchant Restriction (Strict isolation)
        if ($role === 'merchant') {
            $restaurantId = $user->restaurant?->id;
            if (!$restaurantId) return response()->json(['data' => []]);
            $products = \App\Models\Product::where('restaurant_id', $restaurantId)->with(['category', 'restaurant'])->latest()->get();
            return ProductResource::collection($products);
        }

        // 2. Admin/SuperAdmin Precision Scoping (Enforce One-by-One)
        if (in_array($role, ['admin', 'super_admin', 'Admin', 'Super Admin'])) {
            if (!$targetId) {
                return response()->json(['data' => []], 200); // Admin must select a merchant
            }
            $products = \App\Models\Product::where('restaurant_id', $targetId)->with(['category', 'restaurant'])->latest()->get();
            return ProductResource::collection($products);
        }

        // 3. Public/Mobile Application (Unified View)
        $products = \App\Models\Product::with(['category', 'restaurant'])->latest()->get();
        return ProductResource::collection($products);
    }

    public function show($id)
    {
        $product = $this->service->getProductById($id);

        if (!$product) {
            return response()->json(['message' => 'Product not found'], 404);
        }
        return new ProductResource($product);
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();

        // Ownership Assignment
        if ($request->user()->role === 'merchant') {
            $data['restaurant_id'] = $request->user()->restaurant?->id;
            if (!$data['restaurant_id']) return response()->json(['message' => 'No restaurant found'], 400);
        } elseif ($request->user()->role === 'admin' && $request->has('restaurant_id')) {
            $data['restaurant_id'] = $request->restaurant_id;
        }

        $product = $this->service->createProduct($data);
        Cache::forget('products_all');     
        Cache::forget('categories_active');

        // Broadcast refresh to mobile side
        $this->fcmService->broadcastData(['type' => 'refresh_products', 'action' => 'created', 'id' => (string)$product->id]);

        return new ProductResource($product);
    }

    public function update(ProductRequest $request, $id)
    {
        $product = \App\Models\Product::find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);

        // Merchant Ownership Check
        if ($request->user()->role === 'merchant' && $product->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized access to this product'], 403);
        }

        $updated = $this->service->updateProduct($id, $request->validated());
        
        Cache::forget('products_all');     
        Cache::forget("product_{$id}");

        // Broadcast refresh to mobile side
        $this->fcmService->broadcastData(['type' => 'refresh_products', 'action' => 'updated', 'id' => (string)$id]);

        return response()->json(['message' => 'Product updated successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $product = \App\Models\Product::find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);

        // Merchant Ownership Check
        if ($request->user()->role === 'merchant' && $product->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->service->deleteProduct($id);
        Cache::forget('products_all');     
        Cache::forget("product_{$id}");

        // Broadcast refresh to mobile side
        $this->fcmService->broadcastData(['type' => 'refresh_products', 'action' => 'deleted', 'id' => (string)$id]);

        return response()->json(['message' => 'Product deleted successfully']);
    }

    public function addReview(Request $request, $id)
    {
        $request->validate([
            'rating'  => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500'
        ]);

        $review = \App\Models\Review::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $id],
            ['rating'  => $request->rating, 'comment' => $request->comment]
        );

        // Bust product cache so new rating shows
        Cache::forget("product_{$id}");

        return response()->json([
            'message' => 'Review submitted successfully',
            'data'    => new \App\Http\Resources\ReviewResource($review)
        ]);
    }
}
