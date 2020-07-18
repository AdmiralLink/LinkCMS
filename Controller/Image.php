<?php

namespace LinkCMS\Controller;

class Image extends Database {
    static $dbTable = 'images';
    static $fields = ['altText', 'caption', 'imageUrl', 'title', 'imageCredit'];
}