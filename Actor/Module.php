<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;

class Module {
    /**
     * Runs the modules for the system, which is really how everything runs.
     */
    const MODULES_DIR = __DIR__ . '/../Modules/';
    public $active = [];
    private $config;
    public $disabled = [];

    public function __construct() {
        /**
         * Checks for current modules as defined in the configuration. Adds a menu item for module settings, and applicable routes, before loading the modules themselves.
         */
        $modules = Config::get_config('modules');
        if ($modules) {
            $this->disabled = $modules->disabled;
            $this->active = $modules->active;
            $this->config = $modules;
        }
        $this->add_menu_items();
        Route::add_route(['\LinkCMS\Actor\Module', 'add_routes']);
        $this->load_modules();
    }
    
    private function add_menu_items() {
        Core::add_menu_item('modules', 'Modules', '/manage/modules', false, false, 10);
    }

    public static function add_routes() {
        /**
         * Adds routes for module management page
         */
        Flight::route('GET /manage/modules', function() {
            if (User::is_authorized(UserModel::USER_LEVEL_ADMIN)) {
                $core = Core::load();
                $core->modules->load_modules_from_disk();
                Display::load_page('/manage/modules.twig', ['modulesList'=>$core->modules]);
            }
        });
    }

    private function add_to_disabled($moduleName, $problem) {
        /**
         * Adds a given module to the disabled list, along with why
         */
        $item = new \stdClass();
        $item->name = $moduleName;
        $item->problem = $problem;
        $this->disabled[$moduleName] = $item;
    }
    
    private function build_module_list() {
        /**
         * Builds module list based on what's available in the module directory.
         */
        $modulesDir = scandir(self::MODULES_DIR);
        foreach ($modulesDir as $location) {
            if ($location == '.' || $location == '..')
                continue;
            if (is_dir(self::MODULES_DIR . $location)) {
                if (file_exists(self::MODULES_DIR . $location . '/module.json')) {
                    try {
                        $details = json_decode(file_get_contents(self::MODULES_DIR . $location . '/module.json'));
                        if (!isset($details->name) || !isset($details->register)) {
                            $this->add_to_disabled($location, 'Invalid module.json: Missing name or register functions');
                        } else {
                            array_push($this->active, $details);
                        }
                    } catch (\Exception $e) {
                        $this->add_to_disabled($location, 'Invalid module.json');
                    }
                } else {
                    $this->add_to_disabled($location, 'Missing module.json');
                }
            }
        }
    }

    private function load_modules() {
        /**
         * Loads all active modules for system use
         */
        foreach ($this->active as $module) {
            if (!class_exists($module->register[0], FALSE)) {
                call_user_func($module->register);
            }
        }
    }

    private function save_to_config() {
        /**
         * Saves module list to the system configuration
         */
        $modules = new \stdClass();
        $modules->disabled = $this->disabled;
        $modules->active = $this->active; 
        Config::set_config('modules', $modules);
    }

    public function load_modules_from_disk() {
        /**
         * The parent function that runs automatically when you load the module management page. 
         */
        $this->active = [];
        $this->disabled = [];
        $this->missing = [];
        $this->build_module_list();
        $this->save_to_config();
    }
}