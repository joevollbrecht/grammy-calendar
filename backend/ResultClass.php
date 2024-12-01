<?php
class Result{
    public $result = null;
    function __construct(){
        $this->result = array("success"=>true,"body"=>array(),"messages"=>array());
    }
    public function setSuccess($value = true ){
        $this->result["success"] = $value;
    }
    public function setBody($value = array()){
        $this->result["body"] = $value;
    }
    public function getResultString(){
        error_log(print_r($this->result,true));
        return json_encode($this->result);
    }
    public function addMessage(int $level, string $message){
        error_log("addMessage: level:".$level." message:".$message);
        $messages = $this->result["messages"];
        error_log("messages length on entrance".count($messages));
        $messages[] = array("type"=>$level, "message"=>$message);
        $this->result["messages"] = $messages;
        error_log("messages length on exit".count($messages));
    }
}