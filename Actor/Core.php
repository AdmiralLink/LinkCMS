<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Controller\Database;
use LinkCMS\Model\Menu;
use LinkCMS\Model\User;

class Core {
    const CACHE_DIR = __DIR__ . '/../Cache';
    
    var $config;
    var $db;
    var $hooks = [];
    var $filters = [];
    var $menu;
    var $messages = [];
    var $modules;

    public static function add_filter($filterName, $function) {
        /** 
         * Adds a filter that will be run on a core instance of something (e.g., changing the output of a core function or variable)
         * 
         * @param String $filterName The name of the filter
         * @param $function Either an array of a fully namespaced function or an anonymous function to be called by the filter
         */
        $core = self::load();
        if (!isset($core->filters[$filterName])) {
            $core->filters[$filterName] = [];
        }
        array_push($core->filters[$filterName], $function);
    }

    public static function add_menu_item(String $slug, String $name, String $href, $attributes=false, Int $weight=50) {
        /**
        * @param String $slug The slug of the current item (needs to be unique)
        * @param String $name The name you want displayed in the menu
        * @param String $href The href to be displayed (use relative links)
        * @param Int $weight Where you want it displayed in the menu, lower number is higher up. If items have the same number, they'll be sorted alphabetically by slug. Default is 50
        * @param $attributes An array of arrays for attributes to be set on the menu item
        */
        $core = Core::load();
        $core->menu->add_item($slug, $name, $href, $attributes, false, $weight);
    }

    public static function add_message($message, $type='error') {
        /**
         * Adds a message that will be displayed in the core
         * 
         * @param String $message The message you want to display (default 'info')
         * @param String $type The type of message (error, alert, info)
         * @param String $persist Whether the message should be peristed in the database across page load (default false)
         * @param String $template Where you want the message to display (default 'all')
         */

        $core = self::load();

        $msg = new \stdClass();
        $msg->type = $type;
        $msg->message = $message;

        if (isset($_SESSION)) {
            if (!isset($_SESSION['messages'])) {
                $_SESSION['messages'] = [];
            }
            array_push($_SESSION['messages'], $msg);
        } else {
            array_push($core->messages, $msg);
        }
    }

    public static function add_submenu_item(String $parentItemSlug, String $slug, String $name, String $href, Int $weight=50, $attributes=false) {
        /**
         * Adds a submenu item to an existing parent item, identified by $parentItemSlug. If the $parentItemSlug doesn't exist, it'll throw an exception
         * 
         * @param String $parentItemSlug The slug of the parent item
         * @param String $slug The slug of the current item (needs to be unique)
         * @param String $name The name you want displayed in the menu
         * @param String $href The href to be displayed (use relative links)
         * @param Int $weight Where you want it displayed in the menu, lower number is higher up. If items have the same number, they'll be sorted alphabetically by slug. Default is 50
         * @param $attributes An array of arrays for attributes to be set on the menu item
         */
        $core = Core::load();
        $core->menu->add_item($slug, $name, $href, $attributes, $parentItemSlug, $weight);
    }

    public static function attach_to_hook(String $hookName, $function) {
        /**
         * Attaches a function to a hook that is called in core
         * 
         * @param String $hookName The name of the hook you want to attach to
         * @param $function Either an array of a fully namespaced function or an anonymous function to be called by the filter
         */
        $core = self::load();
        if (!isset($core->hooks[$hookName])) {
            $core->hooks[$hookName] = [];
        }
        array_push($core->hooks[$hookName], $function);
    }

    public static function do_filter(String $filterName, $data) {
        /**
         * Performs a filter set elsewhere in the code.
         * 
         * @param String $filterName The name/slug of the filter to run
         * @param $data The data that should be run through the filter
         */
        $core = self::load();
        
        if (isset($core->filters[$filterName]) && count($core->filters[$filterName]) > 0) {
            foreach ($core->filters[$filterName] as $function) {
                $data = call_user_func($function, $data);
            }
        }
        return $data;
    }

    public static function do_hook($hookName, $data=false) {
        /**
         * Performs a hook set elsewhere in the code.
         * 
         * @param String $hookName The name/slug of the filter to run
         */
        $core = self::load();
        
        if (isset($core->hooks[$hookName]) && count($core->hooks[$hookName]) > 0) {
            foreach ($core->hooks[$hookName] as $function) {
                $return = call_user_func($function, $data);
            }
        } else {
            return false;
        }
        return $return;
    }
        
    public static function get_db() {
        /**
         * Gets the instantiated PDO instance for database work
         */
        $core = self::load();
        if (!$core->db) {
            $core->db = new Database();
        }
        return $core->db;
    }

    public static function get_messages() {
        /**
         * Get the messages to display on the screen. (System-only)
         */
        $messages = [];
        if (isset($_SESSION['messages']) && !empty($_SESSION['messages'])) {
            $messages = $_SESSION['messages'];
            $_SESSION['messages'] = [];
        } 
        $core = Core::load();
        if (!empty($core->messages)) {
            $messages = array_merge($messages, $core->messages);
        }
        if (!empty($messages)) {
            return $messages;
        } else {
            return false;
        }
    }

    public static function has_hook($hookName) {
        $core = Core::load();
        if (isset($core->hooks[$hookName]) && count($core->hooks[$hookName]) > 0) {
            return true;
        } else {
            return false;
        }
    }

    public static function load() {
        /** 
         * Returns the current core object
         */
        return $GLOBALS['linkcmscore'];
    }

    public static function load_core() {
        /**
         * Sets up the core object (system-only)
         */
        if (!isset($GLOBALS['linkcmsconfig'])) {
            $GLOBALS['linkcmsconfig'] = new Config();
        }
        
        Route::register_handlers();

        $GLOBALS['linkcmscore']->config = Config::load();
        $GLOBALS['linkcmscore']->menu = new Menu('Core');

        $GLOBALS['linkcmscore']->modules = new Module();
        
        API::load();

        Route::do_routes();
    }
}

$GLOBALS['linkcmscore'] = new Core();