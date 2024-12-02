<?php
include_once 'BaseClass.php';
class FamilyMember extends Base{
    public int $id;
    public string $firstName;
    public string $lastName;
    public string $fullName;

    function __construct(int $id, string $firstName, string $lastName, string $fullName){
        parent::__construct();
        $this->id = $id;
        $this->firstName = $firstName;
        $this->lastName = $lastName;
        $this->fullName = $fullName;
    }
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
    static public function insert(string $firstName, string $lastName){
        $member = self::getByFirstLast($firstName,$lastName);
        if(is_null($member)){
            $myStatement = self::$conn->prepare("INSERT INTO `FamilyMember` 
                (`firstName`, `lastName`) 
                VALUES (".$firstName.",".$lastName.")");
            $myStatement->execute();
            self::$result->setSuccess(true);
            self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        }
        else{
            self::$result->setSuccess(false);
            self::$result->addmessage(2,"family member already exists");
        }
        return self::$result;
    }
    static public function getByFirstLast(string $firstName, string $lastName){
        $queryString = "SELECT * FROM FamilyMember where ".
            "firstname = '".$firstName."' AND lastname = '".$lastName."'";
        $myStatement = self::$conn->prepare($queryString);
        $myStatement->execute();
        $retVal = null;
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            $retVal = new FamilyMember($row["id"],$row["firstname"],$row["lastname"],$row["fullName"]);
        }
        return $retVal;
    }

}