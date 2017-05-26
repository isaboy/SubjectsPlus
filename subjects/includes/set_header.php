<?php
/**
 * Created by PhpStorm.
 * User: acarrasco
 * Date: 5/25/2017
 * Time: 12:24 PM
 */

$environment = getenv('HTTP_HOST');

global $PATH_FROM_ROOT;
global $THEME_FOLDER;
global $THEME_BASE_DIR;

switch($environment) {
    case 'development.library.miami.edu':
    case 'sp4.local':
        $PATH_FROM_ROOT = "//dev-www.library.miami.edu";
        $THEME_FOLDER = "//dev-www.library.miami.edu/themes/";
        $THEME_BASE_DIR = "//dev-www.library.miami.edu/wp-content/themes/umiami/";
        break;
    case 'localhost':
    default:
        $PATH_FROM_ROOT = "//library.miami.edu";
        $THEME_FOLDER = "//library.miami.edu/themes/";
        $THEME_BASE_DIR = "//library.miami.edu/wp-content/themes/umiami/";
        break;
}