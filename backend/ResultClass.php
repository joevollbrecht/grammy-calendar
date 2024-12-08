<?php
class Result{
    public $result = null;
    function __construct(bool $success = true){
        $this->result = array("success"=>$success,"body"=>array(),"messages"=>array());
    }
    public function getSuccess(){
        return $this->result["success"];
        
    }
    public function setBody($value = array()){
        $this->result["body"] = $value;
    }
    public function setMessages($value = array()){
        $this->result["messages"] = $value;
    }
    public function setSuccess($value = true ){
        $this->result["success"] = $value;
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