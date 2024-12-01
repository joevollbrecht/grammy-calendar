<?php
include_once 'BaseClass.php';
class FamilyRelationship extends Base{
    public $id;
    public $familyMemberId1;
    public $familyMemberId2;
    public $familyRelationshipTypeId;
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM FamilyRelationship");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function insert($familyMemberId1, $familyMemberId2, $familyRelationshipTypeId){
        $myStatement = self::$conn->prepare("INSERT INTO `FamilyRelationship` 
            (`familyMemberId1`, `familyMemberId2`, `familyRelationshipTypeId`) 
            VALUES (".$familyMemberId1.",".$familyMemberId2.",".$familyRelationshipTypeId.")");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->setBody("inserted ".$myStatement->row_count()." rows");
        return self::$result;
    }
}