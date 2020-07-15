<?php

namespace LinkCMS\Controller;

use \PDO;
use LinkCMS\Actor\Config;
use LinkCMS\Actor\Core;

class Database {
    static $dbTable;
    static $fields;

    var $connection;

    public function __construct() {
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
        $db = Core::get_db();

        $query = $db->connection->prepare('DELETE FROM ' . static::$dbTable . ' WHERE ' . $field . ' ' . $evaluator . ' :value');
        $query->execute(['value'=>$value]);
    }

    public static function get_field($field) {
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
        $db = Core::get_db();

        $queryString = 'SELECT * FROM ' . static::$dbTable;
        if ($offset) {
            $queryString .= ' OFFSET ' . $offset;
        }
        if ($limit) {
            $queryString .= ' LIMIT ' . $limit;
        }
        if ($orderBy) {
            $queryString .= ' ORDREBY ' . $orderBy;
        }
        $query = $db->connection->prepare($queryString);
        $query->execute();
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }


    public static function load_collection_by(String $field, $value, $evaluator='=') {
        $db = Core::get_db();

        $query = $db->connection->prepare('SELECT * FROM ' . static::$dbTable . ' WHERE '. $field . ' ' . $evaluator . ' :value');
        $query->execute(['value'=>$value]);
        return $query->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function load_by(String $field, $value) {
        $db = Core::get_db();
        
        $query = $db->connection->prepare('SELECT * FROM ' . static::$dbTable . ' WHERE ' . $field . ' = :value');
        $query->execute([':value'=>$value]);
        return $query->fetch(PDO::FETCH_ASSOC);
    } 

    public static function save($object) {
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
        $db = Core::get_db();
        $id = false;
        if (isset($updateObj->id)) {
            $id = $updateObj->id;
            unset($updateObj->id);
        }
        if (!$id) {
            self::save($updateObj);
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