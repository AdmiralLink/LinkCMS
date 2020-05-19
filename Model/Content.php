<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Core;

abstract class Content {
    var $author;
    var $content;
    var $modifiedDate;
    var $publishDate;
    var $slug;
    var $status;
    var $taxonomy;
    var $title;
    static $type;
    static $statuses = ['draft'=>'Draft','published'=>'Published'];

    public function get_statuses() {
        $statuses = Core::do_filter('statuses', STATIC::$statuses);
        return Core::do_filter(STATIC::$type . '_statuses', $statuses);
    }

    public static function status_name($slug) {
        $statuses = Core::do_filter('statuses', STATIC::$statuses);
        $statuses = Core::do_filter(STATIC::$type . '_statuses', $statuses);
        if (in_array($slug, array_keys($statuses))) {
            return $statuses[$slug];
        }
    }
}