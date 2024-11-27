function foo(){
   echo 'foo';
}

function bar(){
   echo 'bar';
}

if($_GET['action'] == 'foo'){
    foo();
} elseif($_GET['action'] == 'bar') {
    bar();
}

exit();