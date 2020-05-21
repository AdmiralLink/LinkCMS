<?php

namespace LinkCMS\Actor;

use LinkCMS\Model\Form as FormModel;

class FormHandler {
    var $error;
    var $formData;
    var $formModel;
    var $validated;

    public function __construct($formData, FormModel $model) {
        $this->formData = $formData;
        $this->formModel = $model;
        $this->check_required_fields();
    }

    private function check_required_fields() {
        if (isset($this->formModel->requiredFields) && count($this->formModel->requiredFields) > 0) {
            foreach ($this->formModel->requiredFields as $required) {
                if (isset($this->formData[$required])) {
                    continue;
                } else {
                    throw new \Exception('Missing required field ' . $required);
                }
            }
        }
        $this->validated = true;
        return true;
    }
}