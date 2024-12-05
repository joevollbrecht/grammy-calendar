<?php
include_once 'BaseClass.php';
class EventPlanningDates extends Base{
    public int $id;
    public int $familyMemberId;
    public int $eventId;
    public string $startDate;
    public string $endDate;
    function __construct(int $id, int $eventId,  int $familyMemberId, string $startDate, string $endDate){
        parent::__construct();
        $this->id = $id;
        $this->eventId = $eventId;
        $this->familyMemberId = $familyMemberId;
        $this->startDate = $startDate;
        $this->endDate = $endDate;
    }
    static public function delete(array $ids){
        $myStatement = self::$conn->prepare("DELETE FROM `EventPlanningDates` 
            WHERE id IN (".implode(",",$ids).")");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"deleted ".$myStatement->rowCount()." rows (may include relationships)");
    
        return self::$result;
    }
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM EventPlanningDates");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function getOverlappingDates(int $eventId, int $familyMemberId, string $startDate, string $endDate){
        $myStatement = self::$conn->prepare("SELECT a.*, f.fullName, e.name as eventName
            FROM EventPlanningDates a
            JOIN familyMember f on f.id = a.familyMemberId
            JOIN event e on e.id = a.eventId
            WHERE eventId = $eventId AND familyMemberId = $familyMemberId
                AND $startDate <= endDate AND $endDate >= startDate");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function insert(int $eventId, int $familyMemberId, string $startDate, string $endDate){
        $sqlQuery = "INSERT IGNORE INTO `EventPlanningDates` 
            (eventId, familyMemberId, startDate, endDate)
            VALUES ($eventId, $familyMemberId, $startDate, $endDate)";
        $myStatement = self::$conn->prepare($sqlQuery);
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        return self::$result;
    }
}