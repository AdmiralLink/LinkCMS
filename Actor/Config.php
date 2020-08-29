<?php

namespace LinkCMS\Actor;

class Config {
    const ROOT_DIR = __DIR__ . '/..';
    const CONFIG_FILE_LOCATION = self::ROOT_DIR . '/site.json';

    var $config;
    var $configLoaded = false;

    public function __construct() {
        $this->load_configuration();
    }

    public static function get_config($param=false) {
        /**
         * 
         * Checks to see if a config value exists; if so, returns the value
         */
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
        /**
         * Returns the current system config (useful within other functions)
         */
        return $GLOBALS['linkcmsconfig'];
    }

    private function load_configuration() {
        /**
         * Loads the config file from disk
         */
        if (file_exists(self::CONFIG_FILE_LOCATION)) {
            $this->config = self::load_current_config_file();
            $this->configLoaded = true;
            return true;
        } else {
            Error::internal_error_handler(new \Exception('No site.json found. Please place a proper site.json file in the root directory, or reinstall'), true);
        }
    }

    public static function load_current_config_file() {
        /**
         * 
         * The helper function that loads the config file. Broken out into separate function from load_configuration above because we need to use it after a change is saved
         */
        return json_decode(file_get_contents(self::CONFIG_FILE_LOCATION));
    }

    public static function reload_config() {
        /** 
         * Function to reload the configuration from disk (usually after a change is saved)
         * 
        */
        $GLOBALS['linkcmsconfig']->load_configuration();
    }

    public static function save_config_file($data, $update=true) {
        /**
         * Saves config file to disk
         */
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
        /**
         * Sets a parameter to a given value; saves configuration to disk so it's not lost
         */
        $core = self::load();
        if (isset($core->config->{$parameter})) {
            if ($core->config->{$parameter} !== $value) {
                $core->config->{$parameter} = $value;
                self::save_config_file($core->config);
            }
        }
    }
}