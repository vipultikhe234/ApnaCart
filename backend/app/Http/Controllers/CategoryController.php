<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Resources\CategoryResource;
use App\Http\Requests\CategoryRequest;
use App\Services\CategoryService;

class CategoryController extends Controller
{
    public function __construct(
        protected CategoryService $service,
        protected \App\Services\FCMService $fcmService
    ) {}

    public function index(Request $request)
    {
        $user = $request->user('sanctum');
        $role = $user?->role ?? 'guest';
        $targetId = $request->restaurant_id;

        // Logging
        \Log::info("Admin-Category-Scoping Trace", [
            'role' => $role,
            'merchant_id' => $targetId,
            'is_auth' => !!$user
        ]);

        // 1. Merchant Restriction
        if ($role === 'merchant') {
            $restaurantId = $user->restaurant?->id;
            if (!$restaurantId) return response()->json(['data' => []]);
            $categories = Category::where('restaurant_id', $restaurantId)
                                 ->orWhereNull('restaurant_id') // Give them global ones too
                                 ->with('restaurant')
                                 ->latest()
                                 ->get();
            return CategoryResource::collection($categories);
        }

        // 2. Admin/SuperAdmin Precision Scoping (Strict selection only)
        if (in_array($role, ['admin', 'super_admin', 'Admin', 'Super Admin'])) {
            if (!$targetId) {
                return response()->json(['data' => []], 200);
            }
            $categories = Category::where('restaurant_id', $targetId)->with('restaurant')->latest()->get();
            return CategoryResource::collection($categories);
        }

        // 3. Public/Mobile - Global Fetch
        $categories = Category::with('restaurant')->latest()->get();
        return CategoryResource::collection($categories);
    }

    public function store(CategoryRequest $request)
    {
        $data = $request->validated();
        if ($request->user()->role === 'merchant') {
            $data['restaurant_id'] = $request->user()->restaurant?->id;
        } elseif ($request->user()->role === 'admin' && $request->has('restaurant_id')) {
            $data['restaurant_id'] = $request->restaurant_id;
        }

        $category = $this->service->createCategory($data);
        \Illuminate\Support\Facades\Cache::forget('categories_all');
        \Illuminate\Support\Facades\Cache::forget('categories_active');

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'created', 'id' => (string)$category->id]);

        return new CategoryResource($category);
    }

    public function update(CategoryRequest $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        if ($request->user()->role === 'merchant' && $category->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->service->updateCategory($id, $request->validated());
        
        \Illuminate\Support\Facades\Cache::forget('categories_all');
        \Illuminate\Support\Facades\Cache::forget('categories_active');

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'updated', 'id' => (string)$id]);

        return response()->json(['message' => 'Category updated successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        if ($request->user()->role === 'merchant' && $category->restaurant_id !== $request->user()->restaurant?->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $this->service->deleteCategory($id);
        
        \Illuminate\Support\Facades\Cache::forget('categories_all');
        \Illuminate\Support\Facades\Cache::forget('categories_active');

        // Broadcast refresh
        $this->fcmService->broadcastData(['type' => 'refresh_categories', 'action' => 'deleted', 'id' => (string)$id]);

        return response()->json(['message' => 'Category deleted']);
    }
}
