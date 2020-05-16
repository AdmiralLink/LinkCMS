<?php

namespace LinkCMS\Actor;

class Update {
    var $core;

    public function __construct() {
        $this->core = Core::load();
        $currentVersion = ($this->core->get_config('version')) ? $this->core->get_config('version') : 0;
        if ($currentVersion == 0) {
            $currentVersion = 0.1;
        }
        Config::set_config('version', $currentVersion);
    }

    public static function update() {
        new Update();
    }
}