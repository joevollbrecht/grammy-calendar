<?php
include_once 'BaseClass.php';
class EventPlanningDates extends Base{
    public int $id;
    public int $familyMemberId;
    public int $eventId;
    public int $dateStatusId;
    public string $startDate;
    public string $endDate;
    function __construct(int $id, int $eventId,  int $familyMemberId, int $dateStatusId, string $startDate, string $endDate){
        parent::__construct();
        $this->id = $id;
        $this->eventId = $eventId;
        $this->familyMemberId = $familyMemberId;
        $this->dateStatusId = $dateStatusId;
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
        return $retVal;
    }
    static public function getByEvent(int $eventId){
        $myStatement = self::$conn->prepare("SELECT epd.*, ei.familyMemberId, fm.fullName, ei.eventId, ei.name as eventName
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            JOIN Event e on e.id = ei.eventId
            JOIN FamilyMember fm on fm.id = ei.familyMemberId
            WHERE ei.eventInviteId = $eventId
        ");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static public function getOverlappingDates(int $eventId, int $familyMemberId, string $startDate, string $endDate){
        $myStatement = self::$conn->prepare("SELECT a.*, f.fullName, e.name as eventName
            FROM EventPlanningDates a
            JOIN EventInvite ei on ei.id = a.eventInviteId
                AND ei.familyMemberId = $familyMemberId
                AND ei.eventId = $eventId
            JOIN Event e on e.id = ei.eventId
            JOIN FamilyMember f on f.id = ei.familyMemberId
            WHERE eventId = $eventId AND familyMemberId = $familyMemberId
                AND '$startDate' <= a.endDate AND '$endDate' >= a.startDate");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static public function insert(int $eventId, int $familyMemberId, int $dateStatusId, string $startDate, string $endDate){
        $sqlQuery = "INSERT IGNORE INTO `EventPlanningDates` 
            (eventInviteId, dateStatusId, startDate, endDate)
            select id,$dateStatusId, '$startDate', '$endDate'
                from EventInvite where eventId=$eventId AND familyMemberId = $familyMemberId";
        $myStatement = self::$conn->prepare($sqlQuery);
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        return self::$result;
    }
}