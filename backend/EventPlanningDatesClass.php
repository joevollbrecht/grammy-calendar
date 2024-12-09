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
    static function getByEventWithMinDates(int $eventId){
        $array = self::getByEvent($eventId);
        $dateArray = self::getMinDateRangesByEvent($eventId);
        function sorter(array $a, array $b) {
            return [$a['startDate'], $a['endDate'], $a['fullName'] ] <=> [$b['startDate'], $b['endDate'], $b['fullName'] ];
        }
        function incDate($inDate){
            $date=date_create($inDate);
            date_add($date,date_interval_create_from_date_string("1 days"));
            return date_format($date,"Y-m-d");
        }
        function decDate($inDate){
            $date=date_create($inDate);
            date_sub($date,date_interval_create_from_date_string("1 days"));
            return date_format($date,"Y-m-d");
        }
        usort($array,"sorter");
        $retVal = array();
        foreach($array as $key => $element){
            ['startDate' => $startDate, 'endDate' => $endDate] = $element;
            for($i = 0, $size = count($dateArray); $i < $size; ++$i) {
                ['startDate' => $tStart, 'endDate' => $tEnd] = $dateArray[$i];
                if($endDate<$tStart 
                || ($startDate>=$tStart && $endDate<=$tEnd)){ //completely contained
                    $retVal[] = $element;
                    break;
                }
                if($startDate > $tEnd){
                    continue;
                }
                if($startDate<$tStart && $endDate>$tEnd){ //element extends past on both sides
                    $newElement = $element;
                    $newElement['endDate'] = decDate($startDate); //startDate-1
                    $retVal[] = $newElement;
                    $newElement['startDate'] = $tStart;
                    $newElement['endDate'] = $tEnd;
                    $retVal[] = $newElement;
                    $element['startDate'] = incDate(tEnd); //endDate+1
                    $startDate = $element['startDate'];
                    continue;
                }
                if($startDate<$tStart){ //endDate included in current
                    $newElement = $element;
                    $newElement['endDate'] = decDate($startDate); //startDate-1
                    $retVal[] = $newElement;
                    $element['startDate'] = $tStart;
                    $startDate = $element['startDate'];
                    $retVal[] = $element;
                    break;
                }
                //start date included in current
                $newElement = $element;
                $newElement['endDate'] = $tEnd;
                $retVal[] = $newElement;
                $element['startDate'] = incDate($tEnd);
                $startDate = $element['startDate'];
            }
        }
        usort($retVal, "sorter");
        return $retVal;
    }
    static public function getMinDateRangesByEvent(int $eventId){
        function sorter(array $a, array $b) {
            return [$a['startDate'], $a['endDate'] ] <=> [$b['startDate'], $b['endDate'] ];
        }
        function incDate($inDate){
            $date=date_create($inDate);
            date_add($date,date_interval_create_from_date_string("1 days"));
            return date_format($date,"Y-m-d");
        }
        function decDate($inDate){
            $date=date_create($inDate);
            date_sub($date,date_interval_create_from_date_string("1 days"));
            return date_format($date,"Y-m-d");
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
        $retVal = array();
        foreach($tempArray as $key => $element){
            ['startDate' => $startDate, 'endDate' => $endDate] = $element;
            for($i = 0, $size = count($tempArray); $i < $size; ++$i) {
                ['startDate' => $tStart, 'endDate' => $tEnd] = $tempArray[$i];
                if($endDate<$tStart 
                || ($startDate>=$tStart && $endDate<=$tEnd)){ //completely contained
                    $retVal[] = $element;
                    break;
                }
                if($startDate > $tEnd){
                    continue;
                }
                if($startDate<$tStart && $endDate>$tEnd){ //element extends past on both sides
                    $newElement = $element;
                    $newElement['endDate'] = decDate($startDate); //startDate-1
                    $retVal[] = $newElement;
                    $newElement['startDate'] = $tStart;
                    $newElement['endDate'] = $tEnd;
                    $retVal[] = $newElement;
                    $element['startDate'] = incDate(tEnd); //endDate+1
                    $startDate = $element['startDate'];
                    continue;
                }
                if($startDate<$tStart){ //endDate included in current
                    $newElement = $element;
                    $newElement['endDate'] = decDate($startDate); //startDate-1
                    $retVal[] = $newElement;
                    $element['startDate'] = $tStart;
                    $startDate = $element['startDate'];
                    $retVal[] = $element;
                    break;
                }
                //start date included in current
                $newElement = $element;
                $newElement['endDate'] = $tEnd;
                $retVal[] = $newElement;
                $element['startDate'] = incDate($tEnd);
                $startDate = $element['startDate'];
            }
        }
        usort($retVal, "sorter");
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