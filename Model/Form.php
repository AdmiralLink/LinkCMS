<?php

namespace LinkCMS\Model;

class Form {
    var $requiredFields = [];
    var $fields = [];
 
    public function __construct($fields) {
        if (is_array($fields)) {
            $this->fields = $fields;
        } else if ($fields) {
            array_push($this->fields, $fields);
        }
        if (!empty($this->fields)) {
            $this->check_for_required_fields();
        }
    }

    public function addField(FormField $field) {
        array_push($this->fields, $field);
        $this->check_for_required_fields();
    }

    private function check_for_required_fields() {
        foreach ($this->fields as $field) {
            if ($field->required) {
                if (!in_array($field->name, $this->requiredFields)) {
                    array_push($this->requiredFields, $field->name);
                }
            }
        }
    } 
}