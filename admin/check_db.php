<?php
$conn = mysqli_connect('127.0.0.1', 'root', '', 'zaidic');
$result = mysqli_query($conn, 'DESCRIBE users;');
echo "Users table structure:\n";
while ($row = mysqli_fetch_assoc($result)) {
    if (in_array($row['Field'], ['id', 'name', 'email', 'profile_picture', 'password'])) {
        echo $row['Field'] . ": " . $row['Type'] . " " . ($row['Null'] === 'YES' ? 'NULL' : 'NOT NULL') . "\n";
    }
}

echo "\nSample user data:\n";
$user = mysqli_fetch_assoc(mysqli_query($conn, 'SELECT id, name, email, profile_picture FROM users LIMIT 1;'));
echo json_encode($user, JSON_PRETTY_PRINT);
?>
