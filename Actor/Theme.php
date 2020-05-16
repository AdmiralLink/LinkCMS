<?php

namespace LinkCMS\Actor;

class Theme {
    var $info;
    var $name;
    const THEME_DIR = __DIR__ . '/../Themes/';

    public function __construct(String $name, $exception=true) {
        $this->name = $name;
        if (file_exists(self::THEME_DIR . $name . '/theme.json')) {
            $this->info = json_decode(file_get_contents(self::THEME_DIR . $name . '/theme.json'));
        } else {
            if ($exception) {
                throw new \Exception('Theme ' . $name . ' is missing required theme.json file. Please check that your theme is correctly installed.');
            }
        }
        if (file_exists(self::THEME_DIR . $name . '/theme.php')) {
            require_once(self::THEME_DIR . $name . '/theme.php');
        } else {
            if ($exception) {
                throw new \Exception('Theme ' . $name . ' is missing required theme.php file. Please check that your theme is correctly installed.');
            }
        }
    }

    public static function load_current_theme() {
        $templateName = Core::get_config('theme');
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