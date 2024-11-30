<?php
include_once 'BaseClass.php';
class FamilyMember extends Base{
    public $id;
    public $firstName;
    public $lastName;
    public $parent;
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM FamilyMember");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }

}