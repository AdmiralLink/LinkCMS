<?php

namespace LinkCMS\Controller;

use \LinkCMS\Actor\Core;
use \LinkCMS\Model\User as UserModel;

class User extends Database {
    static $dbTable = 'users';
    static $fields = ['firstName','lastName','username','email','accessLevel','passwordHash', 'passwordReset', 'passwordResetExpiry'];

    public static function delete($userId) { 
        /**
         * Sets default ::delete as delete by user ID
         */
        self::delete_by('id', $userId);
    }
    
    public static function get_all($field) {
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

    public static function load_all($limit=false, $offset=false, $orderBy=false) {
        /**
         * Loads all using the standard User model
         */
        $db = Core::get_db();
        $order = ($orderBy) ? ' ORDERBY ' . $orderBy : '';
        $query = $db->connection->query('SELECT * FROM ' . static::$dbTable . $order);
        if ($results = $query->fetchAll(\PDO::FETCH_ASSOC)) {
            $users = [];
            foreach ($results as $userData) {
                $user = new UserModel($userData);
                array_push($users, $user);
            }
            return $users;
        } else {
            return false;
        }
    }

    public static function load(int $id) {
        /**
         * Sets default load to load by user ID
         */
        return self::load_by('id', $id);
    }

    public static function load_by($field, $value) {
        /**
         * Returns User objects
         */
        $userData = parent::load_by($field, $value);
        if ($userData) {
            return new UserModel($userData);
        } else {
            return false;
        }
    }

    public static function save($object) {
        /**
         * The generic save function, but strips out unnecessary columns first using self::strip_for_save
         */
        parent::save(self::strip_for_save($object));
    }

    public static function strip_for_save($object) {
        /**
         * Strips out fields we use in the system but that are not saved to the database
         */
        $params = ['fullName', 'isAdmin', 'userLevel'];
        foreach ($params as $param) {
            if (isset($object->{$param})) {
                unset($object->{$param});
            }
        }
        return $object;
    }

    public static function update($object) {
        /**
         * The generic update function, but strips out unnecessary columns first using self::strip_for_save
         */
        parent::update(self::strip_for_save($object));
    }
}