<?php
class Result{
    public $result = null;
    function __construct(){
        $this->setSuccessresult = array("success"=>true,"body"=>array());
    }
    public function setSuccess($value = true ){
        $this->result["success"] = $value;
    }
    public function setBody($value = array()){
        $this->result["body"] = $value;
    }
    public function getResultString(){
        return json_encode($this->result);
    }
}