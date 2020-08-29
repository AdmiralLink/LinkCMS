<?php

namespace LinkCMS\Actor;

use Flight;

class Notify {
    var $content;
    var $type;

    public function __construct($message, $type, $json=true) {
        /**
         * Outputs a JSON message to the screen
         */
        $this->content = $message;
        $this->type = $type;
        if ($json) {
            Flight::json($this);
            exit();
        }
    }

    public static function send_message($message, $type="success") {
        /**
         * Static shortcut for sending a JSON message
         */
        new self($message, $type, true);
    }

    public static function throw_error($message) {
        /**
         * Static shortcut for sending JSON error message
         */
        return ['message'=> new Notify($message, 'error')];
    }
}