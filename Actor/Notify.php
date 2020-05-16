<?php

namespace LinkCMS\Actor;

class Notify {
    var $content;
    var $type;

    public function __construct($message, $type, $json=true) {
        $this->content = $message;
        $this->type = $type;
        if ($json) {
            print json_encode($this);
            exit();
        }
    }

    public static function throw_error($message) {
        return ['message'=> new Notify($message, 'error')];
    }
}