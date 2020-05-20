<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;

class Route {
    public static function add_route($function) {
        /**
         * Adds routing information for the application
         * 
         * @param $function The fully-namespaced function name to call for the route
         */
        $core = Core::load();
        array_push($core->routes, $function);
    }

    public static function add_redirect($location=false, $type=307) {
        if (!$location) {
            $request = \Flight::request();
            $location = $request->url;
        }
        setcookie('redirect', serialize(['location'=>$location, 'type'=>$type]));
    }

    public static function check_redirects($location=false) {
        /**
         * Check if a redirect has been set; if so, go to it, or the parameter. Typically used after login
         * 
         * @param $location The location to redirect to if none set previously (default home page)
         */
        if (isset($_COOKIE['redirect']) && $_COOKIE['redirect']) {
            $redirect = unserialize($_COOKIE['redirect']);
        } else if (isset($_SESSION['redirect'])) {
            $redirect = $_SESSION['redirect'];
        }
        unset($_SESSION['redirect']);
        setcookie('redirect');
        $location = (isset($redirect['location'])) ? $redirect['location'] : $location;
        $type = (isset($redirect['type'])) ? $redirect['type'] : 303;
        if ($location) {
            Flight::redirect($location, $type);
        } else {
            return false;
        }
    }

    public static function do_routes() {
        /**
         * Executes registered routes
         * 
         * System-only
         */
        $core = Core::load();

        Flight::route('GET /manage', function() {
            if (User::is_logged_in()) {
                Route::check_redirects();
                if (User::is_authorized(UserModel::USER_LEVEL_AUTHOR, false)) {
                    Display::load_page('manage/index.twig');
                } else {
                    $user = User::get_current_user();
                    Display::load_page('manage/users/edit/' . $user->username);
                }
            } else {
                Route::add_redirect();
                Flight::redirect('/login');
            }
        });
        
        if (isset($core->routes) && count($core->routes) > 0) {
            foreach ($core->routes as $function) {
                call_user_func($function);
            }
        }

        Flight::map('error', function($e){
            global $whoops;
    
            $core = Core::load();
            if ($core->configLoaded && (Core::get_config('debug') === 'dev')) {
                $whoops->handleException($e);
            } else {
                Error::handle_error($e);
            }
        });
        
        Flight::map('notFound', function() {
            Error::handle_404();
        });

        Flight::start();        
    }

    public static function register_handlers() {
        global $whoops;

        $config = Config::load();
        if ($config->configLoaded && Core::get_config('debug') === 'dev') {
            $whoops = new \Whoops\Run;
            $whoops->prependHandler(new \Whoops\Handler\PrettyPageHandler);
            $whoops->register();
        } else {
            set_exception_handler(['LinkCMS\Actor\Error', 'handle_error']);
        }
    }
}