<?php
include_once 'BaseClass.php';
class FamilyRelationshipType extends Base{
    public $id;
    public $type;
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM FamilyRelationshipType");
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