<?php

namespace LinkCMS\Actor;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Email {
    public static function send($from=false, $to, $subject, $HTMLContent, $textContent) {
        // TODO: Enable SMTP (including settings in Config)
        $from = ($from) ? $from : Config::get_config('adminEmail');;
        $mail = new PHPMailer(true);

        if (is_array($from)) {
            $mail->setFrom($from[0], $from[1]);
        } else {
            $mail->setFrom($from, $from);
        }
        if (is_array($to)) {
            $mail->addAddress($to[0], $to[1]);
        } else {
            $mail->addAddress($to, $to);
        }

        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $HTMLContent;
        if ($textContent) {
            $mail->AltBody = $textContent;
        } else {
            $mail->AltBody = strip_tags($HTMLContent);
        }
        $mail->send();
    }
}