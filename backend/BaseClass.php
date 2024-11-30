<?php
include_once 'ResultClass.php';
class Base{
    public static $result;
    public static $conn;
    public $localResult;
    public static function setConnection($conn){
        self::$conn = $conn;
    }
    public static function createResult($conn){
        self::$result = new Result();
    }
    function __construct(){
        $this->localResult = new Result();
    }
}