<?php

namespace LinkCMS\Controller;

use \LinkCMS\Actor\Core;

class Content extends Database {
    static $dbTable = 'content';
    static $fields = ['type','title','draftContent','draftModifiedDate', 'slug','publishedContent','publishedModifiedDate','pubDate','status',];

    public static function delete($id) {
        self::delete_by('id', $id);
    }

    public static function save($object) {
        // force lowercase, check slug
        foreach ($object as $key=>$value) {
            if ( ($key == 'draftContent' || $key == 'publishedContent') && $value != null) {
                $object->$key = json_encode($value);
            }
        }
        return parent::save($object);
    }

    public static function update($object) {
        // force lowercase, check slug
        foreach ($object as $key=>$value) {
            if ( ($key == 'draftContent' || $key == 'publishedContent') && $value != null) {
                $object->$key = json_encode($value);
            }
        }
        return parent::update($object);
    }
}
