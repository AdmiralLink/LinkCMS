<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Display;

class User {
    var $accessLevel;
    var $email;
    var $id;
    var $isAdmin = false;
    var $firstName;
    var $fullName;
    var $lastName;
    var $passwordHash;
    var $userLevel;
    var $username;

    static $USERLEVELS = [
        1 => 'Basic',
        2 => 'Author',
        3 => 'Subeditor',
        4 => 'Editor',
        5 => 'Administrator'
    ];

    const USER_LEVEL_ADMIN = 5;
    const USER_LEVEL_EDITOR = 4;
    const USER_LEVEL_SUBEDITOR = 3;
    const USER_LEVEL_AUTHOR = 2;
    const USER_LEVEL_BASIC = 1;

    public function __construct($data) {
        if (is_array($data)) {
            foreach ($data as $param=>$value) {
                $this->{$param} = $value;
            }
        } else if (is_object($data)) {
            $this->{$param} = $value;
        }
        if (!isset($this->fullName)) {
            $this->fullName = $this->firstName . ' ' . $this->lastName;
        }
        $this->userLevel = self::get_user_level($this->accessLevel);
        if ($this->userLevel == 'Administrator') {
            $this->isAdmin = true;
        }
    }

    public static function get_user_level(int $level) {
        if ($level < 5 || $level < 1) {
            return false;
        } else {
            return self::$USERLEVELS[$level];
        }
    }
}

Display::register_global('userLevels', User::$USERLEVELS);