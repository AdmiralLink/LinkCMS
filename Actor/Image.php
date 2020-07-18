<?php

namespace LinkCMS\Actor;

use \Flight;
use LinkCMS\Controller\Image as ImageController;
use LinkCMS\Model\Image as ImageModel;
use LinkCMS\Model\User as UserModel;

class Image {
    static $allowedImageTypes = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/svg+xml' => 'svg'];
    static $imagePath = __DIR__ . '/../Public/images/upload/';

    public static function add_routes() {
        Flight::route('POST /api/image/upload', function() {
            User::is_authorized(UserModel::USER_LEVEL_AUTHOR);
            self::move_file();
            $image = new ImageModel($_POST);
            if ($image) {
                $imageId = ImageController::save($image);
                if ($imageId) {
                    Notify::send_message(['id' => $imageId], 'success');
                } else {
                    Notify::throw_error('Database save failed.');
                }
            }
        });
    }

    public static function get_image_directory() {
        $year = date('Y');
        $month = date('M');
        $directory = self::$imagePath . $year . '/' . $month . '/';
        if (!file_exists(self::$imagePath . $year . '/')) {
            mkdir(self::$imagePath . $year);
        }
        if (!file_exists($directory)) {
            mkdir($directory);
        }
        return $directory;
    }

    public static function move_file() {
        if (isset($_FILES['image'])) {
            $image = $_FILES['image'];
            $mimeType = mime_content_type($image['tmp_name']);
            if (!in_array($mimeType, array_keys(static::$allowedImageTypes))) {
                Notify::throw_error('Invalid image type');
            }
            $extension = static::$allowedImageTypes[$mimeType]; 
            $imagePath = self::get_image_directory() . uniqid() . $extension;
            move_uploaded_file($image['tmp_name'], $imagePath);
            $_POST['imageUrl'] = $imagePath;

        } else {
            Notify::throw_error('Improper upload');
        }
    }
}