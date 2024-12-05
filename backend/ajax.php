<?php
require_once 'dbConnect.php';
include_once 'ResultClass.php';
include_once 'BaseClass.php';
include_once 'DateStatusClass.php';
include_once 'EventClass.php';
include_once 'EventInviteClass.php';
include_once 'EventInviteStatusClass.php';
include_once 'EventPlanningDatesClass.php';
include_once 'FamilyMemberClass.php';
include_once 'FamilyRelationshipClass.php';
include_once 'FamilyRelationshipTypeClass.php';
function addEvent(){
    echo Event::insert($_GET['name'])->getResultString();
}
function addEventPlanningDates(){
    $eventId = $_GET['eventId'];
    $familyMemberId = $_GET['familyMemberId'];
    $startDate = $_GET['startDate'];
    $endDate = $_GET['endDate'];
    $dateStatus = $_GET['dateStatus'];
    $retResult = EventPlanningDates::getOverlappingDates($eventId, $familyMemberId, $dateStatus, $startDate, $endDate);
    if(count($retResult->body)){
        $row = $retResult->body[0];
        $event = $row->eventName;
        $name = $row->fullName;
        $badResult = new Result();
        $badResult->setSuccess(false);
        $badResult->addMessage(3,"overlapping date exists for $name and $event, not created");
        echo $badResult->getResultString();
        return;
    }
    echo EventPlanningDates::insert($eventId, $familyMemberId, $startDate, $endDate)->getResultString();
}
function addFamilyMember(){
    echo FamilyMember::insert($_GET['firstName'],$_GET['lastName'])->getResultString();
}
function addFamilyRelationship(){
    echo FamilyRelationship::insert($_GET['parent'],$_GET['child'],$_GET['type'])->getResultString();
}
function addInvites(){
    echo EventInvite::insert($_GET['eventId'],json_decode($_GET['familyIds']))->getResultString();
}
function deleteEvents(){
    echo Event::delete(json_decode($_GET['ids']))->getResultString();
}
function deleteFamilyMember(){
    echo FamilyMember::delete(json_decode($_GET['ids']))->getResultString();
}
function deleteFamilyRelationship(){
    echo FamilyRelationship::delete(json_decode($_GET['ids']))->getResultString();
}
function deleteInvites(){
    echo EventInvite::delete(json_decode($_GET['ids']))->getResultString();
}
function getAllEventRelationships(){
    echo EventInvite::getAllRelationships()->getResultString();
}
function getAllRelationships(){
    echo FamilyRelationship::getAllRelationships()->getResultString();
}
function getDateStatuses(){
    echo DateStatus::getAll()->getResultString();
}
function getEventInviteStatuses(){
    echo EventInviteStatus::getAll()->getResultString();
}
function getEvents(){
    echo Event::getAll()->getResultString();
}
function getEventsByFamilyMember(){
    echo Event::getByFamilyMember(json_decode($_GET['familyMemberId']))->getResultString();
}
function getEventsWithInvites(){
    $resultSet = Event::getAllWithInvites();
    $result = new Result(true);
    $result->setBody($resultSet);
    echo $result->getResultString();
}
function getFamilyRelationshipTypes(){
    echo FamilyRelationshipType::getAll()->getResultString();
}
function getFamilyMembers(){
    $resultSet =  FamilyMember::getAll();
    $result = new Result(true);
    $result->setBody($resultSet);
    echo $result->getResultString();
}
function getFamilyMembersByEvent(){
    echo FamilyMember::getByEvent(json_decode($_GET['eventId']))->getResultString();
}
function getFamilyMembersWithInvites(){
    $resultSet = FamilyMember::getAllWithInvites();
    $result = new Result(true);
    $result->setBody($resultSet);
    echo $result->getResultString();
}
function updateInviteStatuses(){
    $myUpdates = json_decode($_GET["updates"]);
    $myResult = new Result();
    $successCount = $failCount = 0;
    foreach($myUpdates as $update){
        $tempResult = EventInvite::updateStatus($update->id, $update->newStatus);
        if($tempResult->getSuccess()) $successCount++;
        else $failCount++;
    }
    $myResult->setSuccess(true);
    $myResult->addMessage(1,"update complete, $successCount worked, $failCount failed");
    echo $myResult->getResultString();
}
Base::createResult();
try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    Base::setConnection($conn);
    //echo "Connected to $dbname at $host successfully.";
} catch (PDOException $pe) {
    die ("Could not connect to the database $dbname :" . $pe->getMessage());
}
switch ($_GET['action']){
    case 'addEvent':
        addEvent();
        break;
    case 'addEventPlanningDates':
        addEventPlanningDates();
        break;
    case 'addInvites':
        addInvites();
        break;
    case 'addFamilyMember':
        addFamilyMember();
        break;
    case 'addFamilyRelationship':
        addFamilyRelationship();
        break;
    case 'deleteEvents':
        deleteEvents();
        break;
    case 'deleteInvites':
        deleteInvites();
        break;
    case 'deleteFamilyMember':
        deleteFamilyMember();
        break;
    case 'deleteFamilyRelationship':
        deleteFamilyRelationship();
        break;
    case 'getAllEventRelationships':
        getAllEventRelationships();
        break;
    case 'getAllRelationships':
        getAllRelationships();
        break;
    case 'getDateStatuses':
        getDateStatuses();
        break;
    case 'getEventInviteStatuses':
        getEventInviteStatuses();
        break;
    case 'getEvents':
        getEvents();
        break;
    case 'getEventsByFamilyMember':
        getEventsByFamilyMember();
        break;
    case 'getEventsWithInvites':
        getEventsWithInvites();
        break;
    case 'getFamilyMembers':
        getFamilyMembers();
        break;
    case 'getFamilyMembersByEvent':
        getFamilyMembers();
        break;
    case 'getFamilyMembersWithInvites':
        getFamilyMembersWithInvites();
        break;
    case 'getFamilyRelationshipTypes':
        getFamilyRelationshipTypes();
        break;
    case 'updateInviteStatuses':
        updateInviteStatuses();
        break;
    default:
        $badResult = new Result();
        $badResult->setSuccess(false);
        $badResult->addMessage(3,"Problem in ajax.php main method");
        $badResult->addMessage(3,"unhandled action:".$_GET['action']);
        echo $badResult->getResultString();
        exit();
}
exit();