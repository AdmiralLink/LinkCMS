<?php

namespace LinkCMS\Actor;

class Notify {
    var $content;
    var $type;

    public function __construct($message, $type, $json=true) {
        $this->content = $message;
        $this->type = $type;
        if ($json) {
            Flight::json($this);
            exit();
        }
    }

    public static function send_message($message, $type="success") {
        new self($message, $type, true);
    }

    public static function throw_error($message) {
        return ['message'=> new Notify($message, 'error')];
    }
}