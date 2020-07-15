<?php

namespace LinkCMS\Actor;

use Flight;
use LinkCMS\Controller\Content as ContentController;
use LinkCMS\Model\User as UserModel;

class Content {
    public static function is_slug_taken($slug, $id) {
        $core = Core::load();
        if (!Route::is_namespace_free($slug)) {
            return true;
        } else {
            $slugResult = ContentController::load_by('slug', $slug);
            if (!$slugResult) {
                return false;
            } else {
                if ($slugResult['id'] == $id) {
                    return false;
                } else {
                    return true;
                }
            }
        }
    }

    public static function add_content_routes() {
        Route::add_route(['LinkCMS\Actor\Content', 'do_routes']);
    }

    public static function do_routes() {
        Flight::route('GET /api/content/slugTaken/@slug(/@id)', function($slug, $id) {
            if (User::is_authorized(UserModel::USER_LEVEL_AUTHOR)) {
                if ($slug) {
                    new Notify(Content::is_slug_taken($slug, $id), 'success'); 
                } else {
                    throw new \Exception('Missing slug');
                }
            }
        });
    }
}