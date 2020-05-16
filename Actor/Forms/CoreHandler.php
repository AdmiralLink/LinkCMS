<?php

namespace LinkCMS\Actor\Forms;

use LinkCMS\Actor\Form;

class CoreHandler extends Form {
    var $currentData;
    var $requiredFields = ['siteTitle','siteUrl'];
    var $saveData = ['siteTitle', 'siteUrl','database','debug'];

    public function __construct(Array $formData) {
        parent::__construct($formData);
        $this->set_debug();
    }

    protected function set_debug() {
        if (!isset($this->formData['debug'])) {
            $this->formData['debug'] = false;
        } else {
            if ($this->formData['debug'] !== 'dev') {
                $this->formData['debug'] = true;
            }
        }
    }
}