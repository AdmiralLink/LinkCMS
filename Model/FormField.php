<?php

namespace LinkCMS\Model;

class FormField {
    var $displayLabel;
    var $name;
    var $attributes;
    var $required = false;
    var $type;
    var $value;

    public function __construct($name, $type, $displayLabel=false, $required=false, $value=false, $attributes=false, $values=false) {
        foreach (['name','type','displayLabel','required', 'value','attributes','values'] as $item) {
            $this->{$item} = $$item;
        }
        if ($this->required) {
            if (is_array($this->attributes)) {
                $this->attributes['required'] = null;
            } else {
                $this->attributes = ['required'=>true];
            }
        }
    }
}