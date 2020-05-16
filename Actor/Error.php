<?php

namespace LinkCMS\Actor;

use \Flight;

class Error {
    var $handler404;
    var $handler;

    public static function handle_404() {
        http_response_code(404);
        $error = self::load();
        if ($error->handler404) {
            call_user_func($error->handler404);
        } else {
            Display::load_page('404.twig', []);
        }
    }
    
    public static function handle_error($e, $force=false) {
        $error = self::load();
        $request = Flight::request();
        if (strpos($request->url, '/manage') != 0 && $error->handler) {
            call_user_func($error->handler, $e);
        } else {
            self::internal_error_handler($e);
        }
    }

    public static function internal_error_handler($e, $forceError=false) {
        http_response_code(500);
        $error = new \stdClass();
        $error->message = $e->getMessage();
        $error->file = $e->getFile();
        $error->line = $e->getLine();
        if ($forceError) {
            $error->debug = true;
            Display::load_error_page(['error'=>$error]);
        }
        $error->debug = Core::get_config('debug');
        Display::load_page('error.twig', ['error'=>$error]);
    }
    
    public static function load() {
        return $GLOBALS['linkcmsErrors'];
    }

    public static function register_404_handler($function) {
        $GLOBALS['linkcmsErrors']->handler404 = $function;
    }
    
    public static function register_error_handler($function) {
        $GLOBALS['linkcmsErrors']->handler = $function;
    }
}

$GLOBALS['linkcmsErrors'] = new Error();