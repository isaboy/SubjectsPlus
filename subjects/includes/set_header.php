<?php
/**
 * Created by PhpStorm.
 * User: acarrasco
 * Date: 5/25/2017
 * Time: 12:24 PM
 */

$environment = getenv('HTTP_HOST');

switch($environment) {
    case 'localhost':
        define("PATH_FROM_ROOT", "//library.miami.edu");
        define("THEME_FOLDER", "//library.miami.edu/wp-content/themes/");
        define("THEME_BASE_DIR", "//library.miami.edu/wp-content/themes/umiami/");
        break;
    case 'development.library.miami.edu':
        define("PATH_FROM_ROOT", "//dev-www.library.miami.edu");
        define("THEME_FOLDER", "//dev-www.library.miami.edu/themes/");
        define("THEME_BASE_DIR", "//dev-www.library.miami.edu/wp-content/themes/umiami/");
        break;
    case 'sp4.local':
        define("PATH_FROM_ROOT", "//10.179.1.174/um-library-website");
        define("THEME_FOLDER", "//10.179.1.174/um-library-website");
        define("THEME_BASE_DIR", "//10.179.1.174/um-library-website");
        break;
    default:
        define("PATH_FROM_ROOT", "//library.miami.edu");
        define("THEME_FOLDER", "//library.miami.edu/themes/");
        define("THEME_BASE_DIR", "//library.miami.edu/wp-content/themes/umiami/");
        break;
}