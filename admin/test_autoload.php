<?php
require 'vendor/autoload.php';

$class = 'App\Http\Controllers\Admin\UploadController';
if (class_exists($class)) {
    echo "Class exists: $class\n";
} else {
    echo "Class does not exist: $class\n";
}

// Also test the other controllers
$controllers = [
    'App\Http\Controllers\Auth\AuthController',
    'App\Http\Controllers\Admin\DashboardController',
    'App\Http\Controllers\Admin\ListingController',
];

foreach ($controllers as $c) {
    echo (class_exists($c) ? "✓" : "✗") . " $c\n";
}
