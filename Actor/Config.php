<?php

namespace LinkCMS\Actor;

class Config {
    const ROOT_DIR = __DIR__ . '/..';
    const CONFIG_FILE_LOCATION = self::ROOT_DIR . '/site.json';

    var $config;
    var $configLoaded = false;

    public function __construct() {
        $this->load_configuration();
        if ($this->configLoaded) {
            if (isset($this->config->theme) && $this->config->theme) {
                Theme::load_current_theme();
            } else {
                Core::add_message('Template Name or Namespace not set in config file; frontend pages will not work correctly');
            }
        }
    }

    public static function get_config($param=false) {
        $config = self::load();
        if ($param) {
            if (isset($config->config->{$param})) {
                return $config->config->{$param};
            } else {
                return false;
            }
        } else {
            return $config->config;
        }
    }

    public static function load() {
        return $GLOBALS['linkcmsconfig'];
    }

    private function load_configuration() {
        if (file_exists(self::CONFIG_FILE_LOCATION)) {
            $this->config = self::load_current_config_file();
            $this->configLoaded = true;
            return true;
        } else {
            Error::internal_error_handler(new \Exception('No site.json found. Please place a proper site.json file in the root directory, or reinstall'), true);
        }
    }

    public static function load_current_config_file() {
        return json_decode(file_get_contents(self::CONFIG_FILE_LOCATION));
    }

    public static function reload_config() {
        $GLOBALS['linkcmsconfig']->load_configuration();
    }

    public static function save_config_file($data, $update=true) {
        if ($update) {
            $saveData = self::load_current_config_file();
            foreach ($data as $param=>$value) {
                $saveData->$param = $value;
            }
        } else {
            $saveData = $data;
        }
        file_put_contents(self::CONFIG_FILE_LOCATION, json_encode($saveData, JSON_PRETTY_PRINT));
        Config::reload_config();
    }

    public static function set_config($parameter, $value) {
        $core = self::load();
        if (isset($core->config->{$parameter})) {
            if ($core->config->{$parameter} !== $value) {
                $core->config->{$parameter} = $value;
                self::save_config_file($core->config);
            }
        }
    }
}