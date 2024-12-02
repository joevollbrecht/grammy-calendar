<?php
require_once 'dbConnect.php';
include_once 'ResultClass.php';
include_once 'BaseClass.php';
include_once 'EventClass.php';
include_once 'FamilyMemberClass.php';
include_once 'FamilyRelationshipClass.php';
include_once 'FamilyRelationshipTypeClass.php';
function foo(){
    $result = new Result();
    $result->setSuccess(true);
    echo $result->getResultString();
}

function bar(){
    $result = new Result();
    $result->setSuccess(false);
    $result->setBody("bar");
    echo $result->getResultString();
}
function addEvent(){
    echo Event::insert($_GET['name'])->getResultString();
}
function addFamilyMember(){
    echo FamilyMember::insert($_GET['firstName'],$_GET['lastName'])->getResultString();
}
function addFamilyRelationship(){
    echo FamilyRelationship::insert($_GET['parent'],$_GET['child'],$_GET['type'])->getResultString();
}
function deleteFamilyMember(){
    echo FamilyMember::delete(json_decode($_GET['ids']))->getResultString();
}
function deleteFamilyRelationship(){
    echo FamilyRelationship::delete(json_decode($_GET['ids']))->getResultString();
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
function getAllRelationships(){
    echo FamilyRelationship::getAllRelationships()->getResultString();
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
    case 'foo':
        foo();
        break;
    case 'bar':
        bar();
        break;
    case 'addEvent':
        addEvent();
        break;
    case 'addFamilyMember':
        addFamilyMember();
        break;
    case 'addFamilyRelationship':
        addFamilyRelationship();
        break;
    case 'deleteFamilyMember':
        deleteFamilyMember();
        break;
    case 'deleteFamilyRelationship':
        deleteFamilyRelationship();
        break;
    case 'getAllRelationships':
        getAllRelationships();
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