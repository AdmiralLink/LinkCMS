<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;
use \stdClass;

class API {
    var $publicRoutes;
    var $privateRoutes;

    public function __construct() {
        //TODO: Actual API discovery things
        //TODO: Add save action to settings page (when we get there)
        Route::add_route(['\\LinkCMS\\Actor\\API', 'do_routes']);
        $this->publicRoutes = new stdClass();
        $this->privateRoutes = new stdClass();
        $this->publicRoutes->api = new stdClass();
        foreach (UserModel::$USERLEVELS as $level=>$name) {
            $this->privateRoutes->{$name} = new stdClass();
            $this->privateRoutes->{$name}->api = new stdClass();
        }
    }

    public static function load() {
        if (!isset($GLOBALS['linkcmsAPI'])) {
            $GLOBALS['linkcmsAPI'] = new self();
        } else {
            Route::register_namespace('api');
            return $GLOBALS['linkcmsAPI'];
        }
    }

    public static function add_route(String $route, $permissionLevel=0) {
        $api = self::load();
        $routeComponents = explode('/', $route);
        if ($permissionLevel == 0) {
            $apiTree = $api->publicRoutes;
        } else {
            $apiTree = $api->privateRoutes->{UserModel::get_user_level($permissionLevel)};
        }
        foreach ($routeComponents as $tree) {
            // See above for what comes here
        }
    }

    public static function do_routes() {
        Flight::route('GET /api', function() {
            if (User::is_logged_in()) {
                $user = User::get_current_user();
                self::get_routes($user->accessLevel);
            } else {
                self::get_routes(0);
            }
        });
    }

    public static function get_routes(Int $permissionLevel=0) {
        if ($permissionLevel == 0) {
            $filenmae = 'public';
        } else {
            $filename = UserModel::get_user_level($permissionLevel);
        }
        $fileLocation = Core::CACHE_DIR . '/' . $filename . 'json';
        if (!file_exists($fileLocation)) {
            self::save_routes();    
        }
        Display::header('json');
        print json_encode(file_get_contents($fileLocation));   
    }

    public static function save_routes() {
        $api = self::load();
        foreach (get_object_vars($api->privateRoutes) as $levelName=>$data) {
            file_put_contents(Core::CACHE_DIR . '/' . $levelName . '.json', json_encode($data));
        }
        file_put_contents(Core::CACHE_DIR . '/public.json', json_encode($api->publicRoutes));
    }
}