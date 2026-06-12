<?php
// Simple CLI helper to authenticate and fetch activity logs.
// Usage:
// ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=secret php tools/fetch_logs.php

$backend = 'http://127.0.0.1:8000';
$email = getenv('ADMIN_EMAIL') ?: null;
$password = getenv('ADMIN_PASSWORD') ?: null;

if (!$email || !$password) {
    fwrite(STDERR, "Please set ADMIN_EMAIL and ADMIN_PASSWORD environment variables.\n");
    exit(2);
}

$loginUrl = $backend . '/api/v1/login';
$curl = curl_init($loginUrl);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, ['Accept: application/json', 'Content-Type: application/json']);
curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode(['email' => $email, 'password' => $password]));

$resp = curl_exec($curl);
if ($resp === false) { fwrite(STDERR, "Login request failed: " . curl_error($curl) . "\n"); exit(1);} 
$code = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
// curl_close deprecated in PHP 8.5; use curl_reset to clear the handle
if (function_exists('curl_reset')) {
    curl_reset($curl);
}

$data = json_decode($resp, true);
if ($code !== 200) {
    fwrite(STDERR, "Login failed (HTTP $code): " . ($data['message'] ?? $resp) . "\n");
    exit(3);
}

$token = $data['token'] ?? null;
if (!$token) { fwrite(STDERR, "No token received in login response\n"); exit(4);} 

$logsUrl = $backend . '/api/v1/admin/activity-logs';
$ch = curl_init($logsUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept: application/json', 'Authorization: Bearer ' . $token]);
$out = curl_exec($ch);
if ($out === false) { fwrite(STDERR, "Activity logs request failed: " . curl_error($ch) . "\n"); exit(5);} 
$http = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
if (function_exists('curl_reset')) {
    curl_reset($ch);
}

fwrite(STDOUT, "HTTP $http\n");
fwrite(STDOUT, $out . "\n");

exit(0);
