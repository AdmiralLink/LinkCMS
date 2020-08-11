<?php

namespace LinkCMS\Actor;

class Theme {
    var $info;
    var $name;
    var $directory;
    const THEME_DIR = __DIR__ . '/../Theme/';

    public function __construct(String $name, $exception=true) {
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
        if (isset($this->info->init)) {
            call_user_func($this->info->init);
        }
    }

    public static function load_current_theme() {
        $templateName = Config::get_config('theme');
        return new Theme($templateName);
    }

    public static function get_themes() {
        $themes = array_filter(glob(self::THEME_DIR . '*'));
        if (!empty($themes)) {
            $return = [];
            foreach ($themes as $theme) {
                $name = basename($theme);
                array_push($return, new Theme($name, false));
            }
            return $return;
        } else {
            return false;
        }
    }
}