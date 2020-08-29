<?php

namespace LinkCMS\Actor;

use \Flight;

class Error {
    var $handler404 = '404.twig';
    var $handler;
    const UNAUTHORIZED = 'You are not authorized to view this resource';

    public static function handle_404() {
        /**
         * Handles 404 errors. If theme creators want to use their own handler, they can use the Error::register_404_handler to show a themed page
         */
        $request = Flight::request();
        http_response_code(404);
        $error = self::load();
        if (strpos($request->url, '/api') !== false) {
            Notify::throw_error('No such route exists');
        } else {
            Display::load_page($error->handler404, []);
        }
    }
    
    public static function handle_error($e, $force=false) {
        /**
         * Handles non-404 errors on /manage and /api.
         * API errors are thrown as JSON rather than HTML.
         */
        global $whoops;

        if (is_string($e)) {
            $e = new \Exception($e);
        }

        $core = Core::load();
        $error = self::load();
        $request = Flight::request();
        if (strpos($request->url, '/api') !== false) {
            if ($e->getMessage() == self::UNAUTHORIZED) {
                http_response_code(401);
                Notify::throw_error(self::UNAUTHORIZED);
            } else {
                http_response_code(500);
                Notify::throw_error($e->getMessage());
            }
        } else if (isset($core->config->configLoaded) && $core->config->configLoaded && (Config::get_config('debug') === 'dev')) {
            $whoops->handleException($e);
        } else if (strpos($request->url, '/manage') != 0 && $error->handler) {
            call_user_func($error->handler, $e);
        } else {
            $force = (!$error->handler);
            self::internal_error_handler($e, $force);
        }
    }

    public static function internal_error_handler($e, $forceError=false) {
        /**
         * Handles 404 errors. If theme creators want to use their own handler, they can use the Error::register_404_handler to show a themed page
         */
        http_response_code(500);
        $error = new \stdClass();
        $error->message = (method_exists($e, 'getMessage')) ? $e->getMessage() : $e;
        $error->file = $e->getFile();
        $error->line = $e->getLine();
        if ($forceError) {
            $error->debug = true;
            Display::load_error_page(['error'=>$error]);
        }
        $error->debug = Config::get_config('debug');
        Display::load_page('error.twig', ['error'=>$error]);
    }
    
    public static function load() {
        /**
         * Loads global value for errors.
         * 
         * System-only
         */
        return $GLOBALS['linkcmsErrors'];
    }

    public static function register_404_handler($template) {
        /**
         * For themes to register their own 404 templates.
         */
        $GLOBALS['linkcmsErrors']->handler404 = $template;
    }
    
    public static function register_error_handler($template) {
        /**
         * For themes to register their own errors page templates for PHP errors.
         */
        $GLOBALS['linkcmsErrors']->handler = $template;
    }
}

$GLOBALS['linkcmsErrors'] = new Error();