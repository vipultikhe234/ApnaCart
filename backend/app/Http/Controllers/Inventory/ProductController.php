<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Services\Inventory\ProductService;
use App\Services\Identity\FCMService;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\Review;
use App\Http\Resources\ReviewResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $service,
        protected FCMService $fcmService
    ) {}

    public function index(Request $request)
    {
        $role = $request->user('sanctum')?->role ?? 'guest';
        $targetId = $request->query('restaurant_id');

        // Multidimensional Cache Key
        $cacheKey = "products_r_" . ($targetId ?? 'all') . "_role_" . $role;

        return Cache::remember($cacheKey, 3600, function () use ($targetId) {
            $products = $this->service->getAllProducts($targetId);
            return ProductResource::collection($products);
        });
    }

    public function curated()
    {
        $products = $this->service->getCuratedProducts();
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

    private function clearProductCache($restaurantId = null, $productId = null)
    {
        $roles = ['guest', 'merchant', 'admin', 'super_admin', 'Admin', 'Super Admin'];
        foreach ($roles as $role) {
            if ($restaurantId) {
                Cache::forget("products_r_{$restaurantId}_role_{$role}");
            }
            Cache::forget("products_r_all_role_{$role}");
            Cache::forget("products_r__role_{$role}"); // Catch null case
        }
        
        Cache::forget('products_all');
        if ($productId) {
            Cache::forget("product_{$productId}");
        }
    }

    public function store(ProductRequest $request)
    {
        $data = $request->validated();

        // Ownership Assignment
        if ($request->user()->role === 'merchant') {
            $data['restaurant_id'] = $request->user()->restaurant?->id;
            if (!$data['restaurant_id']) return response()->json(['message' => 'No restaurant found'], 400);
        } elseif (in_array($request->user()->role, ['admin', 'super_admin', 'Admin', 'Super Admin']) && $request->has('restaurant_id')) {
            $data['restaurant_id'] = $request->restaurant_id;
        }

        $product = $this->service->createProduct($data);
        $this->clearProductCache($product->restaurant_id);

        // Broadcast refresh to mobile side
        $this->fcmService->broadcastData(['type' => 'refresh_products', 'action' => 'created', 'id' => (string)$product->id]);

        return new ProductResource($product);
    }

    public function update(ProductRequest $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);

        // Merchant Ownership Check
        if ($request->user()->role === 'merchant' && $product->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized access to this product'], 403);
        }

        $updated = $this->service->updateProduct($id, $request->validated());
        $this->clearProductCache($product->restaurant_id, $id);

        // Broadcast refresh to mobile side
        $this->fcmService->broadcastData(['type' => 'refresh_products', 'action' => 'updated', 'id' => (string)$id]);

        return response()->json(['message' => 'Product updated successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $product = Product::find($id);
        if (!$product) return response()->json(['message' => 'Product not found'], 404);

        // Merchant Ownership Check
        if ($request->user()->role === 'merchant' && $product->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $resId = $product->restaurant_id;
        $this->service->deleteProduct($id);
        $this->clearProductCache($resId, $id);

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

        $review = Review::updateOrCreate(
            ['user_id' => $request->user()->id, 'product_id' => $id],
            ['rating'  => $request->rating, 'comment' => $request->comment]
        );

        // Bust product cache
        $this->clearProductCache(null, $id);

        return response()->json([
            'message' => 'Review submitted successfully',
            'data'    => new ReviewResource($review)
        ]);
    }
}
