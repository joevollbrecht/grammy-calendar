<?php
include_once 'ResultClass.php';
class Base{
    public $return;
    public static $myConn;
    public static function setConnection($conn){
        self::$myConn = $conn;
    }
    function __construct(){
        $this->return = new Result;
    }
}