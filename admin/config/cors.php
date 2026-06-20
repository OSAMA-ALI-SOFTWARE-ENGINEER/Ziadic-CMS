<?php

return [
    'paths' => ['*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        // Development
        'http://localhost:5176',
        'http://127.0.0.1:5176',
        'http://localhost:5175',
        'http://127.0.0.1:5175',
        'http://localhost:5174',
        'http://127.0.0.1:5174',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        // Production
        'https://kukaqka.com',
        'https://www.kukaqka.com',
        'https://admin.kukaqka.com',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
