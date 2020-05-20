<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;

class User {
    public static function check_user_level($userLevel) {
        if (Core::has_hook('check_user_level')) {
            return Core::do_hook('check_user_level', $userLevel);
        } else {
            if ($user = self::get_current_user()) {
                $level = intval($user->accessLevel);
                return ($level >= $userLevel);
            } else {
                return false;
            }
        }
    }

    public static function is_logged_in() {
        if (Core::has_hook('is_logged_in')) {
            if (Core::do_hook('is_logged_in')) {
                return true;
            } else {
                return false;
            }
        } else {
            if (isset($_SESSION['user'])) {
                return true;
            } else {
                return false;
            }
        }
    }

    public static function get_current_user() {
        if (self::is_logged_in()) {
            if (Core::has_hook('get_current_user')) {
                return Core::do_hook('get_current_user');
            } else {
                return $_SESSION['user'];       
            }
        } else {
            return false;
        }
    }

    public static function is_authorized($userLevel = UserModel::USER_LEVEL_BASIC, $redirect=true) {
        if (self::is_logged_in()) {
            return (self::check_user_level($userLevel));
        } else {
            if ($redirect) {
                Route::add_redirect();
                Flight::redirect('/login', 401);
            } else {
                return false;
            }
        }
    }
}