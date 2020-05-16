<?php

namespace LinkCMS\Actor;

class Form {
    var $error;
    var $formData;
    var $requiredFields;
    var $validated;

    public function __construct($formData) {
        $this->formData = $formData;
        $this->check_required_fields();
    }

    private function check_required_fields() {
        if (isset($this->requiredFields) && count($this->requiredFields) > 0) {
            foreach ($this->requiredFields as $required) {
                if (isset($this->formData[$required]) || $this->formData) {
                    continue;
                } else {
                    throw new \Exception('Missing required field ' . $required);
                }
            }
        }
        $this->validated = true;
        return true;
    }

    public static function form_handler(Array $formData) {
        return new self($formData);
    }
}