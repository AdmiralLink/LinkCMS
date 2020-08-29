<?php

namespace LinkCMS\Controller;

use \PDO;
use LinkCMS\Actor\Config;
use LinkCMS\Actor\Core;

class Database {
    /**
     * Generic database class. Sets up the connection, has basic methods for most things but a lot of them get overwritten when applied to specific actions
     */
    static $dbTable;
    static $fields;

    var $connection;

    public function __construct() {
        /**
         * Sets up the connection based on the values in site.json
         */
        $dbInfo = Config::get_config('database');
        $required = ['dbHost', 'dbName', 'dbPassword', 'dbUser'];
        foreach ($required as $parameter) {
            if (!isset($dbInfo->{$parameter})) {
                throw new \Exception('Missing required parameter ' . $parameter .' in site.json');
            }
        }
        $this->connection = new PDO('mysql:host=' . $dbInfo->dbHost . ';dbname=' . $dbInfo->dbName, $dbInfo->dbUser, $dbInfo->dbPassword);
    }

    public static function delete_by(String $field, $value, $evaluator = '=') {
        /**
         * Deletes an item using the specified parameters
         */
        $db = Core::get_db();

        $query = $db->connection->prepare('DELETE FROM ' . static::$dbTable . ' WHERE ' . $field . ' ' . $evaluator . ' :value');
        $query->execute(['value'=>$value]);
    }

    public static function get_count($where=false) {
        /**
         * Gets the total count of an object with an optional where clause
         */
        $db = Core::get_db();
        $where = ($where) ? ' WHERE ' . $where : '';
        $query = $db->connection->prepare('SELECT COUNT(*) as count FROM ' . static::$dbTable . $where);
        $query->execute();
        $result = $query->fetchAll(\PDO::FETCH_ASSOC);
        return $result[0]['count'];
    }

    public static function get_field($field) {
        /**
         * Gets an entire column for a given match
         */
        $db = Core::get_db();
        if ($field) {
            $query = $db->connection->query('SELECT ' . $field . ' FROM ' . static::$dbTable);
            if ($results = $query->fetchAll(\PDO::FETCH_COLUMN, 0)) {
                return $results;
            } else {
                return false;
            }
        } else {
            throw new \Exception('No field found');
        }
    }

    public static function load_all($offset=false, $limit=false, $orderBy=false) {
        /**
         * Loads everything from an existing table
         */
        $db = Core::get_db();

        $queryString = 'SELECT * FROM ' . static::$dbTable;
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
         * Loads everything based on the given parameters. Will often be overwritten
         */
        $db = Core::get_db();
        
        $query = $db->connection->prepare('SELECT * FROM ' . static::$dbTable . ' WHERE ' . $field . ' = :value');
        $query->execute([':value'=>$value]);
        return $query->fetch(PDO::FETCH_ASSOC);
    } 

    public static function save($object) {
        /**
         * Generic save function based on an object. Will be overwritten in most child classes.
         */
        $dataToStore = [];
        $fields = '';
        $valueString = '';
        foreach(static::$fields as $field) {
            $fields .= $field . ','; 
            $dataToStore[$field] = $object->{$field};
            $valueString .= ':' . $field . ',';
        }
        $db = Core::get_db();
        $query = $db->connection->prepare('INSERT INTO ' . static::$dbTable . '(' . substr($fields, 0, -1) . ')' .' VALUES (' . substr($valueString, 0, -1) . ')');
        if ($query->execute($dataToStore)) {
            return $db->connection->lastInsertId();
        } else {
            return false;
        }
    }

    public static function update($updateObj) {
        /**
         * Generic update function based on an object. Will be overwritten in most child classes.
         */
        $db = Core::get_db();
        $id = false;
        if (isset($updateObj->id)) {
            $id = $updateObj->id;
            unset($updateObj->id);
        }
        if (!$id) {
            return self::save($updateObj);
            exit();
        }
        $array = get_object_vars($updateObj);
        $properties = array_keys($array);
        $updateString = '';
        $update = [];
        foreach ($properties as $field) {
            $updateString .=  ',' . $field . '=' . ':' . $field;
            $update[$field] = $updateObj->{$field};
        }
        $updateString = substr($updateString, 1);
        $update['id'] = intval($id);
        $statement = $db->connection->prepare('UPDATE ' . static::$dbTable . ' SET '. $updateString .' WHERE id=:id');
        return $statement->execute($update);
    }
}