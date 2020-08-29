<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Model\User as UserModel;

class Settings {
    /**
     * This is for direct manipulation of some site.json values
     */
    public function __construct() {
        /**
         * Adds route and menu items for settings page. 
         */
        Core::add_menu_item('settings', 'Settings', '/manage/settings', false, false, 30);
        Route::add_route(['\LinkCMS\Actor\Settings', 'add_routes']);
    }

    public static function add_routes() {
        /**
         * Routes for viewing and saving the settings
         */
        Flight::route('GET /manage/settings', function() {
            if (User::is_authorized(UserModel::USER_LEVEL_ADMIN)) {
                Display::load_page('/manage/settings.twig', ['config'=> Config::get_config()]);
            }
        });

        Flight::route('POST /manage/settings', function() {
            if (User::is_authorized(UserModel::USER_LEVEL_ADMIN)) {
                $fields = ['siteTitle', 'adminEmail', 'securityHash', 'theme'];
                $data = new \stdClass();
                foreach ($fields as $field) {
                    if (isset($_POST[$field]) && !empty($_POST[$field])) {
                        $data->{$field} = $_POST[$field];
                    }
                }
                if (!empty($data)) {
                    Config::save_config_file($data);
                }
                Core::add_message('Config saved');
                Flight::redirect('settings');
            }
        });
    }
}