<?php

namespace LinkCMS\Model;

class FormField {
    var $displayLabel;
    var $name;
    var $options;
    var $required = false;
    var $type;
    var $value;

    public function __construct($name, $type, $displayLabel=false, $required=false, $value=false, $options=false) {
        $this->name = $name;
        $this->type = $type;
        $this->displayLabel = $displayLabel;
        $this->required = $required;
        $this->value = $value;
        $this->options = $options;
    }
}