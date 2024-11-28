<?php
require_once 'dbConnect.php';
function foo(){
   echo 'foo';
}

function bar(){
   echo 'bar';
}
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    echo "Connected to $dbname at $host successfully.";
} catch (PDOException $pe) {
    die ("Could not connect to the database $dbname :" . $pe->getMessage());
}

if($_GET['action'] == 'foo'){
    foo();
} elseif($_GET['action'] == 'bar') {
    bar();
}

exit();