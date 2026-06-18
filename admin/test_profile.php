<?php
// Start a session and authenticate
$_SERVER['HTTP_HOST'] = 'localhost:8000';
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['REQUEST_URI'] = '/api/v1/admin/auth/login';

// Load Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Create login request
$loginRequest = new \Illuminate\Http\Request();
$loginRequest->merge([
    'email' => 'admin@kukaqka.com',
    'password' => 'password'
]);

// Login to get token
try {
    $response = $app[\Illuminate\Routing\Router::class]
        ->dispatch(
            $loginRequest->setRouteResolver(function () {})
        );
    echo "Login Response Status: " . $response->getStatusCode() . "\n";
    echo "Response: " . $response->getContent() . "\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
