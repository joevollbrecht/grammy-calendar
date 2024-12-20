<?php
include_once 'BaseClass.php';
class EventInvite extends Base{
    public int $id;
    public int $familyMemberId1;
    public int $familyMemberId2;
    public int $familyRelationshipTypeId;
    function __construct(int $id, int $eventId, int $eventInviteStatusId, int $familyMemberId){
        parent::__construct();
        $this->id = $id;
        $this->eventId = $eventId;
        $this->eventInviteStatusId = $eventInviteStatusId;
        $this->familyMemberId = $familyMemberId;
    }
    static public function delete(array $ids){
        $myStatement = self::$conn->prepare("DELETE FROM `EventInvite` 
            WHERE id IN (".implode(",",$ids).")");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"deleted ".$myStatement->rowCount()." rows (may include relationships)");
    
        return self::$result;
    }
    static public function getAll(){
        $myStatement = self::$conn->prepare("SELECT * FROM EventInvite");
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
        $myStatement = self::$conn->prepare("SELECT invite.id,
            ev.name as eventName, ev.id as eventId,
            fm.fullName as fullName, fm.id as familyId,
            t.type as inviteStatus, t.id as statusId
            FROM `EventInvite` invite 
            JOIN FamilyMember fm on fm.id = invite.familyMemberId
            JOIN Event ev on ev.id = invite.eventId 
            JOIN EventInviteStatus t on t.id = invite.eventInviteStatusId
            ORDER BY ev.id, t.id, fm.id;");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        self::$result->setSuccess(true);
        self::$result->setBody($retVal);
        return self::$result;
    }
    static public function insert(int $eventId, array $familyIds){
        if(count($familyIds) == 0){
            self::$result->addMessage(2,"No family members submitted");
            self::$result->setSuccess(false);
            return self::$result;
        }
        $sqlQuery = "INSERT IGNORE INTO `EventInvite` 
            (eventId, familyMemberId, eventInviteStatusId) VALUES (".$eventId.",".$familyIds[0].",1)";
        for($ii=1;$ii<count($familyIds);$ii++){
            $sqlQuery .= ", (".$eventId.",".$familyIds[$ii].",1)";
        }
        $myStatement = self::$conn->prepare($sqlQuery);
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"inserted ".$myStatement->rowCount()." rows");
        return self::$result;
    }
    static public function updateStatus(int $id, int $newStatus){
        $myStatement = self::$conn->prepare("UPDATE `EventInvite`
            SET eventInviteStatusId = $newStatus 
            WHERE id =$id");
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"updated ".$myStatement->rowCount()." rows (may include relationships)");
    
        return self::$result;
    }
}