<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

echo "Tables list:\n";
$tables = DB::select('SHOW TABLES');
foreach($tables as $table) {
    foreach($table as $key => $value) {
        echo "- $value\n";
    }
}

if (Schema::hasTable('inventories')) {
    echo "\nInventories count: " . DB::table('inventories')->count() . "\n";
    print_r(DB::table('inventories')->get()->toArray());
} else {
    echo "\nInventories table MISSING!\n";
}
