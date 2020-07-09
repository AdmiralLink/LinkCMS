<?php

namespace LinkCMS\Model;

use LinkCMS\Actor\Core;

abstract class Content {
    var $author;
    var $draftContent;
    var $draftTimestamp;
    var $publishedContent;
    var $publishedTimestamp;
    var $slug;
    var $taxonomy;
    var $title;
    static $type;
}
