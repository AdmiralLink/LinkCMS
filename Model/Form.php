<?php

namespace LinkCMS\Model;

class Form {
    /**
     * Used with FormHandler for standard backend forms
     */
    var $requiredFields = [];
    var $fields = [];
 
    public function __construct($fields) {
        if (is_array($fields)) {
            foreach ($fields as $field) {
                if (get_class($field) == 'LinkCMS\Model\FormField') {
                    array_push($this->fields, $field);
                }
            }
        } else if (get_class($fields) == 'LinkCMS\Model\FormField') {
            array_push($this->fields, $fields);
        }
        if (!empty($this->fields)) {
            $this->check_for_required_fields();
        }
    }

    public function add_field(FormField $field) {
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