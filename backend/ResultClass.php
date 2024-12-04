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
        return json_encode($this->result);
    }
    public function addMessage(int $level, string $message){
        $messages = $this->result["messages"];
        $messages[] = array("type"=>$level, "message"=>$message);
        $this->result["messages"] = $messages;
    }
}