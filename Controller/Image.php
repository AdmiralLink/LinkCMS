<?php

namespace LinkCMS\Controller;

use LinkCMS\Actor\Core;
use LinkCMS\Model\Image as ImageModel;

class Image extends Database {
    static $dbTable = 'images';
    static $fields = ['altText', 'caption', 'imageUrl', 'title', 'imageCredit'];

    public static function load_all($offset=false, $limit=20, $orderBy='id DESC') {
        $results = parent::load_all($offset, $limit, $orderBy);
        if ($results) {
            $images = [];
            foreach ($results as $imageData) {
                $image = new ImageModel($imageData);
                array_push($images, $image);
            }
            return $images;
        } else {
            return false;
        }
    }
}