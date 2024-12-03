<?php
include_once 'BaseClass.php';
class FamilyRelationship extends Base{
    public int $id;
    public int $familyMemberId1;
    public int $familyMemberId2;
    public int $familyRelationshipTypeId;
    function __construct(int $id, int $familyMemberId1, int $familyMemberId2, int $familyRelationshipTypeId){
        parent::__construct();
        $this->id = $id;
        $this->familyMemberId1 = $familyMemberId1;
        $this->familyMemberId2 = $familyMemberId2;
        $this->familyRelationshipTypeId = $familyRelationshipTypeId;
    }
    static public function delete(array $ids){
        $myStatement = self::$conn->prepare("DELETE FROM `FamilyRelationship` 
            WHERE id IN (".implode(",",$ids).")");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"deleted ".$myStatement->rowCount()." rows (may include relationships)");
    
        return self::$result;
    }
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM FamilyRelationship
            ORDER BY familyMemberId1, familyRelationshipTypeId DESC, familyMemberId2");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function getAllRelationships(){
        $myStatement = self::$conn->prepare("SELECT fr.id, parent.fullname as parentName, child.fullName as childName, t.type FROM `FamilyRelationship` fr JOIN FamilyMember parent on parent.id = fr.familyMemberId1 JOIN FamilyMember child on child.id = fr.familyMemberId2 JOIN FamilyRelationshipType t on t.id = fr.familyRelationshipTypeId;");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function insert(int $familyMemberId1, int $familyMemberId2, int $familyRelationshipTypeId){
        $member = self::getByMemberIds($familyMemberId1,$familyMemberId2);
        if(is_null($member)){
            $myStatement = self::$conn->prepare("INSERT INTO `FamilyRelationship` 
                (`familyMemberId1`, `familyMemberId2`, `familyRelationshipTypeId`) 
                VALUES (".$familyMemberId1.",".$familyMemberId2.",".$familyRelationshipTypeId.")");
            $myStatement->execute();
            self::$result->setSuccess(true);
            self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        }
        else{
            self::$result->setSuccess(false);
            self::$result->addmessage(2,"relationship already exists");
        }
        return self::$result;
    }
    static public function getByMemberIds(int $familyMemberId1, int $familyMemberId2){
        $queryString = "SELECT * FROM FamilyRelationship where ".
            "(familyMemberId1 = ".$familyMemberId1." AND familyMemberId2 = ".$familyMemberId2.")".
            " OR (familyMemberId1 = ".$familyMemberId2." AND familyMemberId2 = ".$familyMemberId1.")";
        $myStatement = self::$conn->prepare($queryString);
        $myStatement->execute();
        $retVal = null;
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            $retVal = new FamilyRelationShip($row["id"],$row["familyMemberId1"],$row["familyMemberId2"],$row["familyRelationshipTypeId"]);
        }
        return $retVal;
    }
}