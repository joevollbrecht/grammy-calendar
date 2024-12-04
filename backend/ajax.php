<?php
require_once 'dbConnect.php';
include_once 'ResultClass.php';
include_once 'BaseClass.php';
include_once 'EventClass.php';
include_once 'EventInviteClass.php';
include_once 'EventInviteStatusClass.php';
include_once 'FamilyMemberClass.php';
include_once 'FamilyRelationshipClass.php';
include_once 'FamilyRelationshipTypeClass.php';
function addEvent(){
    echo Event::insert($_GET['name'])->getResultString();
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
function getAllEventRelationships(){
    echo EventInvite::getAllRelationships()->getResultString();
}
function getAllRelationships(){
    echo FamilyRelationship::getAllRelationships()->getResultString();
}
function getEventInviteStatuses(){
    echo EventInviteStatus::getAll()->getResultString();
}
function getEvents(){
    echo Event::getAll()->getResultString();
}
function getFamilyRelationshipTypes(){
    echo FamilyRelationshipType::getAll()->getResultString();
}
function getFamilyMembers(){
    echo FamilyMember::getAll()->getResultString();
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
    case 'getEventInviteStatuses':
        getEventInviteStatuses();
        break;
    case 'getEvents':
        getEvents();
        break;
    case 'getFamilyMembers':
        getFamilyMembers();
        break;
    case 'getFamilyRelationshipTypes':
        getFamilyRelationshipTypes();
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