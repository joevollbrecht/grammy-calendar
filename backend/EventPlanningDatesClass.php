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
    static private function calcMinDates($eventArray, $dateArray, $firstCall=false){
        if(!function_exists('p')){
            function p($array){
                $size = count($array);
                if($size){
                    ['startDate' => $startDate, 'endDate' => $endDate] = $array[$size-1];
                    return "size: $size ($startDate - $endDate)";
                }
                else return "empty array";
            }
        }
        static $entryCount = 0;
        if($firstCall){
            $entryCount = 0;
            error_log("first entry to calc, date array:".print_r($dateArray,true));
        }
        $entryCount++;
        $retVal = array();
        $newEventsArray = array();
        $eventArraySize = count($eventArray);
        error_log("entry #$entryCount eventsArray:$eventArraySize ".print_r($eventArray,true));
        foreach($eventArray as $key => $element){
            ['startDate' => $startDate, 'endDate' => $endDate] = $element;
            $didSplit = false;
            for($i = 0, $size = count($dateArray); $i < $size; ++$i) {
                ['startDate' => $tStart, 'endDate' => $tEnd] = $dateArray[$i];
                error_log("entry - element ($key: $startDate - $endDate) dates ($i: $tStart - $tEnd)  retVal(count:".count($retVal).")");
                if($startDate > $tEnd){
                    error_log("$startDate > $tEnd, check next date - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  retVal(count:".count($retVal).")");
                    continue;
                }

                if($endDate<$tStart){
                    // $retVal[] = $element;
                    $didSplit = true;
                    $newEventsArray[] = $element;
                    error_log("$endDate < $tStart, add to retVal - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  newEvent(".p($newEventsArray).")");
                    break;
                }
                if($startDate < $tStart && $endDate >= $tStart){
                    $didSplit = true;
                    $newElement = $element;
                    $newElement['endDate'] = self::decDate($tStart);
                    $newEventsArray[] = $newElement;
                    error_log("$startDate < $tStart && $endDate >= $tStart, split newEvent - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  newEvent=".p($newEventsArray).")");
                    // $retVal[] = $newElement;
                    $element['startDate'] = $tStart;
                    $newEventsArray[] = $element;
                    error_log("$startDate < $tStart && $endDate >= $tStart, split modifiedOrigEvent - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  newEvent=".p($newEventsArray).")");
                    break;
                }
                if($startDate>=$tStart && $endDate<=$tEnd){ //completely contained
                    //$retVal[] = $element;
                    error_log("element completely contained - should pick up later ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  retVal(count:".count($retVal).")");
                    // shouldn't need this, the didSplit logic should handle
                    // if(($key+1)==$eventArraySize){
                    //     // $retVal[]=$element;
                    //     $newEventsArray[]=$element;
                    //     error_log("at end, add it: retVal(".p($newEventsArray).")");
                    // }
                    continue;
                }
                if($startDate >= $tStart && $startDate<$tEnd){ //overlap start
                    $didSplit = true;
                    $newElement = $element;
                    $newElement['endDate'] = $tEnd;
                    $newEventsArray[] = $newElement;
                    error_log("$startDate >= $tStart && $startDate<$tEnd overlap newElement - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  newEvent=".p($newEventsArray).")");
                    // $retVal[] = $newElement;
                    $element['startDate'] = self::incDate($tEnd);
                    $newEventsArray[] = $element;
                    error_log("$startDate >= $tStart && $startDate<$tEnd overlap revisedOrig - element ($key: $startDate-$endDate) dates ($i: $tStart $tEnd)  newEvent=".p($newEventsArray).")");
                    break;
                }
            }
            if(!$didSplit){
                $newEventsArray[] = $element;
                error_log("$didSplit no split, add element - element ($key: $startDate-$endDate) newEvent=".p($newEventsArray).")");
            }
        }
        error_log("through loop#$entryCount , newEntrys size:".count($newEventsArray)."\n".print_r($newEventsArray,true));
        // if(count($newEventsArray) && $entryCount<10){
        if($eventArraySize != count($newEventsArray) && $entryCount<40){
            // $retVal = array_merge($retVal,self::calcMinDates($newEventsArray,$dateArray));
            error_log("rentry, entry size:$eventArraySize, new array size:".count($newEventsArray));
            $newEventsArray = self::calcMinDates($newEventsArray,$dateArray);
        }
        error_log("exit#$entryCount , newEventsArray size:".count($newEventsArray));
        $entryCount--;
        return $newEventsArray;
    }
    static private function decDate($inDate){
        $date=date_create($inDate);
        date_sub($date,date_interval_create_from_date_string("1 days"));
        return date_format($date,"Y-m-d");
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
        $myStatement = self::$conn->prepare("SELECT epd.*, ei.familyMemberId, fm.fullName, ei.eventId, e.name as eventName
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            JOIN Event e on e.id = ei.eventId
            JOIN FamilyMember fm on fm.id = ei.familyMemberId
            WHERE ei.eventId = $eventId
            ORDER BY fm.fullname, epd.startDate
        ");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static public function getByEventAndFamilyMembers(int $eventId, array $familyMemberIds){
        $myStatement = self::$conn->prepare("SELECT epd.*, ei.familyMemberId, 
                fm.fullName, ei.eventId, 
                e.name as eventName
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            JOIN Event e on e.id = ei.eventId
            JOIN FamilyMember fm on fm.id = ei.familyMemberId
            WHERE ei.eventId = $eventId
            AND ei.familyMemberId in (".implode(",", $familyMemberIds).")
            ORDER BY fm.fullname, epd.startDate
        ");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static function getByEventWithMinDates(int $eventId, array $familyMemberIds = []){
        if(count($familyMemberIds)){
            $array =self::getByEventAndFamilyMembers($eventId, $familyMemberIds);
            $dateArray = self::getMinDateRangesByEventAndFamilyMembers($eventId, $familyMemberIds);
        }
        else{
            $array = self::getByEvent($eventId);
            $dateArray = self::getMinDateRangesByEvent($eventId);
        }
        function getByEventWithMinDatesSorter(array $a, array $b) {
            return [$a['startDate'], $a['endDate'], $a['fullName'] ] <=> [$b['startDate'], $b['endDate'], $b['fullName'] ];
        }
        usort($array,"getByEventWithMinDatesSorter");
        $retVal = self::calcMinDates($array, $dateArray, true);
        usort($retVal, "getByEventWithMinDatesSorter");
        return $retVal;
    }
    static public function getMinDateRangesByEvent(int $eventId){
        if(!function_exists('getMinDateRangesByEventSorter')){
            function getMinDateRangesByEventSorter(array $a, array $b) {
                return [$a['startDate'], $a['endDate'] ] <=> [$b['startDate'], $b['endDate'] ];
            }
        }
        $myStatement = self::$conn->prepare("SELECT UNIQUE epd.startDate, epd.endDate
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            WHERE ei.eventId = $eventId
            ORDER BY epd.startDate, epd.endDate
        ");
        $myStatement->execute();
        $tempArray = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($tempArray,$row);
        }
        // $retVal = array();
        // foreach($tempArray as $key => $element){
        //     ['startDate' => $startDate, 'endDate' => $endDate] = $element;
        //     for($i = 0, $size = count($tempArray); $i < $size; ++$i) {
        //         ['startDate' => $tStart, 'endDate' => $tEnd] = $tempArray[$i];
        //         if($endDate<$tStart 
        //         || ($startDate>=$tStart && $endDate<=$tEnd)){ //completely contained
        //             $retVal[] = $element;
        //             break;
        //         }
        //         if($startDate > $tEnd){
        //             continue;
        //         }
        //         if($startDate<$tStart && $endDate>$tEnd){ //element extends past on both sides
        //             $newElement = $element;
        //             $newElement['endDate'] = decDate($startDate); //startDate-1
        //             $retVal[] = $newElement;
        //             $newElement['startDate'] = $tStart;
        //             $newElement['endDate'] = $tEnd;
        //             $retVal[] = $newElement;
        //             $element['startDate'] = self::incDate($tEnd); //endDate+1
        //             $startDate = $element['startDate'];
        //             continue;
        //         }
        //         if($startDate<$tStart){ //endDate included in current
        //             $newElement = $element;
        //             $newElement['endDate'] = self::decDate($startDate); //startDate-1
        //             $retVal[] = $newElement;
        //             $element['startDate'] = $tStart;
        //             $startDate = $element['startDate'];
        //             $retVal[] = $element;
        //             break;
        //         }
        //         //start date included in current
        //         $newElement = $element;
        //         $newElement['endDate'] = $tEnd;
        //         $retVal[] = $newElement;
        //         $element['startDate'] = self::incDate($tEnd);
        //         $startDate = $element['startDate'];
        //     }
        // }
        $retVal = self::calcMinDates($tempArray, $tempArray);
        $retVal = array_unique($retVal, SORT_REGULAR);
        usort($retVal, "getMinDateRangesByEventSorter");
        return $retVal;
    }
    static public function getMinDateRangesByEventAndFamilyMembers(int $eventId, array $familyMemberIds){
        if(!function_exists('getMinDateRangesByEventSorter')){
            function getMinDateRangesByEventSorter(array $a, array $b) {
                return [$a['startDate'], $a['endDate'] ] <=> [$b['startDate'], $b['endDate'] ];
            }
        }
        $myStatement = self::$conn->prepare("SELECT UNIQUE epd.startDate, epd.endDate
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            WHERE ei.eventId = $eventId
            AND ei.familyMemberId in (".implode(",", $familyMemberIds).")
            ORDER BY epd.startDate, epd.endDate
        ");
        $myStatement->execute();
        $tempArray = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($tempArray,$row);
        }

        $retVal = self::calcMinDates($tempArray, $tempArray);
        $retVal = array_unique($retVal, SORT_REGULAR);
        usort($retVal, "getMinDateRangesByEventSorter");
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
    static public function getOverlappingDatesExcludeId(int $id, string $startDate, string $endDate){
        $myStatement = self::$conn->prepare("SELECT epd.*, f.fullName, e.name as eventName, epd.startDate as startDate, epd.endDate as endDate
            FROM EventPlanningDates epd
            JOIN EventInvite ei on ei.id = epd.eventInviteId
            JOIN Event e on e.id = ei.eventId
            JOIN FamilyMember f on f.id = ei.familyMemberId
            WHERE eventId = (SELECT eventId from EventInvite ei
                JOIN EventPlanningDates epd on ei.id = epd.eventInviteId
                WHERE epd.id = $id)
            AND familyMemberId = (SELECT familyMemberId from EventInvite ei
                JOIN EventPlanningDates epd on ei.id = epd.eventInviteId
                WHERE epd.id = $id)
            AND '$startDate' <= epd.endDate AND '$endDate' >= epd.startDate
            AND epd.id != $id");
        $myStatement->execute();
        $retVal = array();
        while ($row = $myStatement->fetch(PDO::FETCH_ASSOC)){
            array_push($retVal,$row);
        }
        return $retVal;
    }
    static private function incDate($inDate){
        $date=date_create($inDate);
        date_add($date,date_interval_create_from_date_string("1 days"));
        return date_format($date,"Y-m-d");
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
    static function summarizeDateInfo(array $inArray){
        $dataSummaryArray = [];
        $s = 'statusCountArray';
        foreach($inArray as $element){
            $startDate = $element['startDate'];
            $dateStatusId = $element['dateStatusId'];
            if(!array_key_exists($startDate,$dataSummaryArray)){
                $dataSummaryArray[$startDate] = ["count"=>0, $s=>[]];
            }
            $dataSummaryArray[$startDate]['count']++;
            if(!array_key_exists($dataSummaryArray[$startDate][$s][$dateStatusId])){
                $dataSummaryArray[$startDate][$s][$dateStatusId] = 0;
            }
            $dataSummaryArray[$startDate][$s][$dateStatusId]++;
        }
        return $dataSummaryArray;
    }
    static function update(int $id, $startDate, $endDate, $dateStatusId){
        $sqlQuery = "UPDATE EventPlanningDates
            SET startDate = '$startDate', endDate ='$endDate', dateStatusId = $dateStatusId
            where id = $id";
        $myStatement = self::$conn->prepare($sqlQuery);
        $myStatement->execute();
        self::$result->setSuccess(true);
        self::$result->addMessage(1,"updated ".$myStatement->rowCount()." row");
        return self::$result;
    }
}