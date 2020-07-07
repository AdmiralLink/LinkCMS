<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Core;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\User as UserActor;

class User {
    var $accessLevel; // Int
    var $email;
    var $id;
    var $isAdmin = false;
    var $firstName;
    var $fullName;
    var $lastName;
    var $passwordHash;
    var $passwordReset;
    var $passwordResetExpiry;
    var $userLevel; // String
    var $username;

    static $USERLEVELS = [
        10 => 'Basic',
        20 => 'Author',
        30 => 'Subeditor',
        40 => 'Editor',
        50 => 'Administrator'
    ];

    const USER_LEVEL_ADMIN = 50;
    const USER_LEVEL_EDITOR = 40;
    const USER_LEVEL_SUBEDITOR = 30;
    const USER_LEVEL_AUTHOR = 20;
    const USER_LEVEL_BASIC = 10;

    public function __construct($data) {
        if (is_array($data)) {
            foreach ($data as $param=>$value) {
                $this->{$param} = $value;
            }
        } else if (is_object($data)) {
            foreach (get_object_vars($data) as $param=>$value) {
                $this->{$param} = $data->{$param};
            }
        }
        if (empty($this->fullName)) {
            $this->set_full_name();
        }
        $this->userLevel = self::get_user_level($this->accessLevel);
        if ($this->userLevel == 'Administrator') {
            $this->isAdmin = true;
        }
    }
    
    public static function get_user_level(int $level) {
        if ($level < 50 || $level < 1) {
            return false;
        } else {
            $levels = UserActor::get_user_levels();
            return $levels[$level];
        }
    }

    public function set_full_name() {
        $this->fullName = $this->firstName . ' ' . $this->lastName;
    }
}