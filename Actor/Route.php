<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Actor\Core;
use LinkCMS\Actor\FormInstallHandler;
use LinkCMS\Actor\Display;
use LinkCMS\Actor\Notify;
use LinkCMS\Model\User;

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

    public static function add_redirect($location=false) {
        if (!$location) {
            $request = \Flight::request();
            $location = $request->url;
        }
        setcookie('redirect', $location);
    }

    public static function check_redirects($location='/') {
        /**
         * Check if a redirect has been set; if so, go to it, or the parameter. Typically used after login
         * 
         * @param $location The location to redirect to if none set previously (default home page)
         */
        if (isset($_COOKIE['redirect'])) {
            $location = $_COOKIE['redirect'];
            unset($_SESSION['redirect']);
        } else if (isset($_SESSION['redirect'])) {
            $location = $_SESSION['redirect'];
            unset($_SESSION['redirect']);
        }
        Flight::redirect($location);
    }

    public static function do_routes() {
        /**
         * Executes registered routes
         * 
         * System-only
         */
        $core = Core::load();

        Flight::route('GET /manage', function() {
            if (Core::is_logged_in()) {
                if (Core::is_authorized(User::USER_LEVEL_EDITOR)) {
                    Display::load_page('manage/index.twig');
                } else {
                    $user = Core::get_user();
                    Display::load_page('manage/users/edit/' . $user->username);
                }
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
        }
    }
}