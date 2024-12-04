<?php
include_once 'BaseClass.php';
class Event extends Base{
    public int $id;
    public string $name;
    public string $startDate;
    public string $endDate;

    function __construct(int $id, string $name, string $startDate, string $endDate){
        parent::__construct();
        $this->id = $id;
        $this->name = $name;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }
    static public function delete(array $ids){
        $myStatement = self::$conn->prepare("DELETE FROM `Event` 
            WHERE id IN (".implode(",",$ids).")");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"deleted ".$myStatement->rowCount()." rows (may include relationships)");
    
        return self::$result;
    }
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM Event");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function getAllWithInvites(){
        $myStatement = self::$conn->prepare("SELECT * FROM Event
            WHERE id in (SELECT eventId from EventInvite)");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static public function getByFamilyMember(int $familyMemberId){
        $myStatement = self::$conn->prepare("SELECT e.* FROM Event e
            JOIN EventInvite ei on e.id = ei.eventId
            WHERE ei.familyMemberId = $familyMemberId");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;        
    }
    static public function insert(string $name){
        $myStatement = self::$conn->prepare("INSERT INTO `Event` 
            (`name`) 
            VALUES ('".$name."')");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        return self::$result;
    }
    static public function getByFirstLast(string $firstName, string $lastName){
        $queryString = "SELECT * FROM Event where ".
            "firstname = '".$firstName."' AND lastname = '".$lastName."'";
        $myStatement = self::$conn->prepare($queryString);
        $myStatement->execute();
        $retVal = null;
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            $retVal = new Event($row["id"],$row["firstname"],$row["lastname"],$row["fullName"]);
        }
        return $retVal;
    }

}