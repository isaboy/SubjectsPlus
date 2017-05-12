<?php
/**
 * Created by PhpStorm.
 * User: acarrasco
 * Date: 5/5/2017
 * Time: 2:36 PM
 */

if (isset($_SERVER['HTTP_REFERER'])){
    $referer = $_SERVER['HTTP_REFERER'];
    $referer = parse_url($referer);
    $referer = $referer["host"];
}else{
    $referer = $_SERVER['SERVER_NAME'];
}

switch($referer) {
    //Define SP urls
    case 'development.library.miami.edu':
        define('SITE_URL', 'http://development.library.miami.edu');
        define('CONF_PATH', '/subversion/www/html/devel/dev-non-svn/rails_projects/sp4dev-staging-afc/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'sp');
        break;

    case 'library.miami.edu':
        define('SITE_URL', 'http://sp4.local');
        break;

    case 'sp4.local':
        define('SITE_URL', 'http://sp4.local');
        define('CONF_PATH', '/var/www/sp4.local/public/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'sp');
        break;

    //Define WP urls
    case 'dev-www.library.miami.edu':
        define('SITE_URL', 'http://dev-www.library.miami.edu/');
        define('CONF_PATH', '/subversion/www/html/devel/dev-non-svn/rails_projects/sp4dev-staging-afc/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'wp');
        break;

//    case 'library.mssssssiami.edu':
//        define('SITE_URL', 'http://sp4.local');
//        break;
//
    case '10.179.1.174':
        define('SITE_URL', 'http://10.179.1.174/um-library-website');
        define('CONF_PATH', '/var/www/sp4.local/public/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'wp');
        break;
}