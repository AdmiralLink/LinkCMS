<?php

namespace LinkCMS\Actor;

use Flight;
use LinkCMS\Controller\Content as ContentController;
use LinkCMS\Model\User as UserModel;

class Content {
    var $registry;

    public function __construct() {
        /**
         * Adds routes for basic Content actions
         */
        $this->registry = new \stdClass();
        Route::add_route(['LinkCMS\Actor\Content', 'do_routes']);
    }

    public function add_content_type($slug, $class) {
        /**
         * Helper function to add a specific content type to the registry of content types
         */
        if (isset($this->registry->{$slug})) {
            var_dump($slug);
            var_dump($this->registry->{$slug});
            exit();
            throw new \Exception('Content type already exists');
        }
        $this->registry->{$slug} = $class;
    }

    public static function is_slug_taken($slug, $id) {
        /**
         * This function checks that slugs are available; it only checks off the web root (e.g., it'll see if you.com/content is available, but does not care about you.com/things/content).
         * All basic content types are assumed to be hanging off the root. If they aren't, they should be using a separate table. This function will check the namespace registry as well as the content database.
         */
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

    public static function do_routes() {
        /**
         * Creates API route for checking if slugs are available.
         */
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