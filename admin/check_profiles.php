<?php
$conn = mysqli_connect('127.0.0.1', 'root', '', 'zaidic');
$result = mysqli_query($conn, 'SELECT id, name, email, profile_picture FROM users WHERE profile_picture IS NOT NULL;');
echo "Users with profile pictures:\n";
$count = 0;
while ($row = mysqli_fetch_assoc($result)) {
    echo json_encode($row) . "\n";
    $count++;
}
echo "\nTotal users with profile pictures: $count\n";

// Check storage directory
echo "\nFiles in storage/app/public/profiles:\n";
$dir = __DIR__ . '/storage/app/public/profiles';
if (is_dir($dir)) {
    $files = scandir($dir);
    foreach ($files as $file) {
        if ($file !== '.' && $file !== '..') {
            echo "  - $file\n";
        }
    }
} else {
    echo "Directory not found: $dir\n";
}
?>
