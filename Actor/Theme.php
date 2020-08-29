<?php

namespace LinkCMS\Actor;

class Theme {
    var $info;
    var $name;
    var $directory;
    const THEME_DIR = __DIR__ . '/../Theme/';

    public function __construct(String $name, $exception=true) {
        /**
         * Called to load the current theme, as defined in site.json
         * 
         * System-only
         * */
        $this->name = $name;
        if (file_exists(self::THEME_DIR . $name . '/theme.json')) {
            $this->info = json_decode(file_get_contents(self::THEME_DIR . $name . '/theme.json'));
            Display::add_template_directory(self::THEME_DIR . $name);
            $this->initialize_theme();
        } else {
            if ($exception) {
                throw new \Exception('Theme ' . $name . ' is missing required theme.json file. Please check that your theme is correctly installed.');
            }
        }
    }

    private function initialize_theme() {
        /** 
         * Calls theme functions
         *
         * System-only
         */
        if (isset($this->info->init)) {
            call_user_func($this->info->init);
        }
    }

    public static function load_current_theme() {
        /**
         * Loads current theme from Config value.
         * 
         * System-only
         */
        $templateName = Config::get_config('theme');
        return new Theme($templateName);
    }
}