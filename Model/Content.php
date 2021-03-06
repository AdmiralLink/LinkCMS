<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Core;

class Content {
    var $draftContent;
    var $draftModifiedDate;
    var $excerpt;
    var $id;
    var $pubDate;
    var $publishedContent;
    var $publishedModifiedDate;
    var $slug;
    var $status;
    var $template;
    var $title;
    var $type;

    public function __construct($data=false) {
        if ($data) {
            if (is_array($data)) {
                foreach ($data as $param => $value) {
                    if ($value == 'null' || $value == 'false')
                        continue;
                    if (($param == 'publishedContent' || $param == 'draftContent') && is_string($value)) {
                        $value = json_decode($value);
                    }
                    $this->{$param} = $value;
                }
            }
        }   
    }
}
