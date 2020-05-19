<?php

namespace LinkCMS\Actor;

use \Flight;

class Module {
    const MODULES_DIR = __DIR__ . '/../Modules/';
    public $active = [];
    private $config;
    public $disabled = [];

    public function __construct() {
        $modules = Core::get_config('modules');
        if (isset($modules)) {
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
        Flight::route('GET /manage/modules', function() {
            $core = Core::load();
            $core->modules->load_modules_from_disk();
            Display::load_page('/manage/modules.twig', ['modulesList'=>$core->modules]);
        });
    }

    private function add_to_disabled($moduleName, $problem) {
        $item = new \stdClass();
        $item->name = $moduleName;
        $item->problem = $problem;
        $this->disabled[$moduleName] = $item;
    }
    
    private function build_module_list() {
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
        foreach ($this->active as $module) {
            if (!class_exists($module->register[0], FALSE)) {
                call_user_func($module->register);
            }
        }
    }

    private function save_to_config() {
        $modules = new \stdClass();
        $modules->disabled = $this->disabled;
        $modules->active = $this->active; 
        Config::set_config('modules', $modules);
    }

    public function load_modules_from_disk() {
        $this->active = [];
        $this->disabled = [];
        $this->missing = [];
        $this->build_module_list();
        $this->save_to_config();
    }
}