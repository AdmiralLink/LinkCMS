<?php

namespace LinkCMS\Controller;

use \LinkCMS\Actor\Core;
use \LinkCMS\Model\User as UserModel;

class User extends Database {
    static $dbTable = 'users';
    static $fields = ['firstName','lastName','username','email','accessLevel','passwordHash'];

    public static function load_all($orderBy=false) {
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
        $userData = self::load_by('id', $id);
        if ($userData) {
            return new UserModel($userData);
        } else {
            return false;
        }
    }
}