<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;

class Route {
    var $namespaces = ['manage'];
    var $routes = [];

    public static function add_route($function) {
        /**
         * Adds routing information for the application
         * 
         * @param $function The fully-namespaced function name to call for the route
         */
        $routes = self::load();
        
        array_push($routes->routes, $function);
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
        $routes = self::load();

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
        
        if (isset($routes->routes) && count($routes->routes) > 0) {
            foreach ($routes->routes as $function) {
                call_user_func($function);
            }
        }

        Flight::map('error', function($e){
            Error::handle_error($e);
        });
        
        Flight::map('notFound', function() {
            Error::handle_404();
        });

        Flight::start();        
    }

    public static function is_namespace_free(String $namespace) {
        $routes = self::load();
        return (!in_array($namespace, $routes->namespaces));
    }

    public static function load() {
        if (!isset($GLOBALS['linkcmsRoutes'])) {
            $GLOBALS['linkcmsRoutes'] = new self();
        }
        return $GLOBALS['linkcmsRoutes'];
    }

    public static function register() {
        self::register_handlers();
        self::register_folder_loader();
    }

    public static function register_handlers() {
        global $whoops;

        $config = Config::load();
        if ($config->configLoaded && Config::get_config('debug') === 'dev') {
            $whoops = new \Whoops\Run;
            $whoops->prependHandler(new \Whoops\Handler\PrettyPageHandler);
            $whoops->register();
        } else {
            set_error_Handler(['LinkCMS\Actor\Error', 'handle_error']);
            set_exception_handler(['LinkCMS\Actor\Error', 'handle_error']);
        }
    }

    public static function register_folder_loader() {
        Flight::map('register_manage_folder', function($sourceDir, $destPath) {
            self::register_folder_map($sourceDir, $destPath, 'manage');
        });

        Flight::map('register_public_folder', function($sourceDir, $destPath) {
            self::register_folder_map($sourceDir, $destPath, 'public');
        });
    }

    public function register_folder_map($sourceDir, $destPath, $type) {
        if (is_dir($sourceDir)) {
            $frontPath = ($type == 'manage') ? '/manage/' : '';
            $path = 'GET ' . $frontPath . $destPath . '/@file';
            Flight::route($path, function($file) use ($sourceDir) {
                if (file_exists($sourceDir . '/' . $file)) {
                    print file_get_contents($sourceDir . '/' . $file);
                } else {
                    Error::throw('File not found');
                }
            });
        } else {
            throw new \Exception('Source for '. $type . '/' . $destPath .' is not a directory.');
        }
    }


    public static function register_namespace(String $namespace) {
        $routes = self::load();
        if (self::is_namespace_free($namespace, $routes->namespaces)) {
            array_push($routes->namespaces, $namespace);
        } else {
            throw new \Exception('/' . $namespace . ' already declared.');
        }
    }
}