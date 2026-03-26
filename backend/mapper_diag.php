<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\Category;

echo "Available Categories:\n";
Category::all()->each(fn($c) => print("NAME: {$c->name}, ID: {$c->id}\n"));

echo "\nProducts Mapping:\n";
Product::all()->each(fn($p) => print("PROD: {$p->name}, CAT_ID: " . ($p->category_id ?? 'NULL') . "\n"));
