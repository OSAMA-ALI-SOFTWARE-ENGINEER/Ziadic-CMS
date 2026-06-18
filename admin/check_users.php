<?php
$conn = mysqli_connect('127.0.0.1', 'root', '', 'zaidic');
$result = mysqli_query($conn, 'SELECT id, name, email, profile_picture FROM users ORDER BY id;');
echo "All users in database:\n";
while ($row = mysqli_fetch_assoc($result)) {
    echo json_encode($row) . "\n";
}
?>
