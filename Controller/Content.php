<?php

namespace LinkCMS\Controller;

use \LinkCMS\Actor\Core;

class Content extends Database {
    /**
     * Standard Content controller. Most often will be overwritten by a child class for a given content type, but there are some cases (checking if slugs exist) where the generic
     * class will be used. 
     */
    static $dbTable = 'content';
    static $fields = ['type', 'title', 'template', 'draftContent', 'draftModifiedDate', 'slug', 'publishedContent', 'publishedModifiedDate', 'pubDate', 'status', 'excerpt'];

    public static function delete($id) {
        /**
         * Shortcut for Content::delete_by($id)
         */
        self::delete_by('id', $id);
    }

    public static function load_all($offset=false, $limit=false, $orderBy=false) {
        /**
         * Loads all content pieces by $type, which should be overwritten by child class
         */
        $db = Core::get_db();

        $queryString = 'SELECT * FROM ' . static::$dbTable . ' WHERE type = "' . static::$type . '"';
        if ($orderBy) {
            $queryString .= ' ORDER BY ' . $orderBy;
        }
        if ($limit) {
            $queryString .= ' LIMIT ' . $limit;
        }
        if ($offset) {
            $queryString .= ' OFFSET ' . $offset;
        }
        $query = $db->connection->prepare($queryString);
        $query->execute();
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function load_by(String $field, $value) {
        /**
         * Loads all content pieces by $type and where the given $field = $value
         */
        $db = Core::get_db();
        if (isset(static::$type)) {
            $query = $db->connection->prepare('SELECT * FROM ' . static::$dbTable . ' WHERE type = "' . static::$type . '" AND ' . $field . ' = :value');
        } else {
            $query = $db->connection->prepare('SELECT * FROM ' . static::$dbTable . ' WHERE ' . $field . ' = :value');
        }
        $query->execute([':value'=>$value]);
        return $query->fetch(\PDO::FETCH_ASSOC);
    }
    
    public static function load_published($offset=false, $limit=false, $orderBy='pubdate DESC') {
        /**
         * Loads all content pieces that are status 'published' by $type, which should be overwritten by child class
         */
        $db = Core::get_db();

        $queryString = 'SELECT * FROM ' . static::$dbTable . ' WHERE status = "published" AND type = "' . static::$type . '"';
        if ($orderBy) {
            $queryString .= ' ORDER BY ' . $orderBy;
        }
        if ($limit) {
            $queryString .= ' LIMIT ' . $limit;
        }
        if ($offset) {
            $queryString .= ' OFFSET ' . $offset;
        }
        $query = $db->connection->prepare($queryString);
        $query->execute();
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function save($object) {
        /**
         * Saves an object while json_encoding the content fields
         */
        foreach ($object as $key=>$value) {
            if ( ($key == 'draftContent' || $key == 'publishedContent') && $value != null) {
                $object->$key = json_encode($value);
            }
        }
        return parent::save($object);
    }

    public static function update($object) {
        /**
         * Updates an object while json_encoding the content fields
         */
        foreach ($object as $key=>$value) {
            if ( ($key == 'draftContent' || $key == 'publishedContent') && $value != null) {
                $object->$key = json_encode($value);
            }
        }
        return parent::update($object);
    }
}
