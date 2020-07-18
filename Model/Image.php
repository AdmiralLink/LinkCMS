<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Notify;

class Image {
    var $altText;
    var $caption;
    var $id;
    var $imageCredit;
    var $imageUrl;
    var $title;

    public function __construct($imageArray) {
        if (is_array($imageArray)) {
            $required = ['altText', 'title', 'imageUrl'];
            foreach ($required as $item) {
                if (!isset($imageArray[$item]) || empty($imageArray[$item])) {
                    Notify::throw_error('Missing required '. $item . ' for image');
                }
            }
            foreach ($imageArray as $item=>$value) {
                if (property_exists($this, $item)) {
                    $this->{$item} = $value;
                }
            }
        } else {
            Notify::throw_error('Improper image image format');
        }
    }
}