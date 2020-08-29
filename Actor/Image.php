<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Controller\Image as ImageController;
use LinkCMS\Model\Image as ImageModel;
use LinkCMS\Model\User as UserModel;

class Image {
    /**
     * Image handling class
     */
    static $allowedImageTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/svg+xml' => 'svg'];
    static $imagePath = __DIR__ . '/../Public/images/upload/';

    public static function add_routes() {
        /**
         * Adds upload and API loader offsets
         */
        Flight::route('POST /api/image/upload', function() {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            self::move_file();
            $image = new ImageModel($_POST);
            if ($image) {
                $imageId = ImageController::save($image);
                if ($imageId) {
                    $image->id = $imageId;
                    Notify::send_message(['image' => $image], 'success');
                } else {
                    Notify::throw_error('Database save failed.');
                }
            } else {
                Notify::throw_error('No image found');
            }
        });

        Flight::route('GET /api/image/load(/@offset)', function($offset) {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            Notify::send_message(['images' => ImageController::load_all($offset), 'count' => ImageController::get_count()], 'success');
        });
    }

    public static function get_image_directory() {
        /**
         * Gets the image directory based on the current date (used for uploads)
         */
        $year = date('Y');
        $month = date('M');
        $directory = $year . '/' . $month . '/';
        if (!file_exists(self::$imagePath . $year . '/')) {
            mkdir(self::$imagePath . $year);
        }
        if (!file_exists(self::$imagePath . $directory)) {
            mkdir(self::$imagePath . $directory);
        }
        return $directory;
    }

    public static function move_file() {
        /**
         * Moves uploaded files to their destination. Randomizes file names for security (and because I hate SEO-ing images)
         */
        if (isset($_FILES['image'])) {
            $image = $_FILES['image'];
            $mimeType = mime_content_type($image['tmp_name']);
            if (!in_array($mimeType, array_keys(static::$allowedImageTypes))) {
                Notify::throw_error('Invalid image type');
            }
            $extension = static::$allowedImageTypes[$mimeType]; 
            $imagePath = self::get_image_directory() . uniqid() . '.' . $extension;
            move_uploaded_file($image['tmp_name'], self::$imagePath . $imagePath);
            $imageUrl = Config::get_config('siteUrl') . '/images/upload/' . $imagePath;
            $_POST['imageUrl'] = $imageUrl;

        } else {
            Notify::throw_error('Improper upload');
        }
    }
}