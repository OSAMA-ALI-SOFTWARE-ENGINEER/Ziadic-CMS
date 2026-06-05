<?php

use Illuminate\Support\Facades\Route;

Route::get('/simple-test', function () {
    return ['message' => 'Simple test works!'];
});
