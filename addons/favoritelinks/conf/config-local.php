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

    case 'localhost/sp4/sp4-favlinks-pv':
        define('SITE_URL', 'http://localhost/sp4/sp4-favlinks-pv');
        define('CONF_PATH', '/Applications/MAMP/htdocs/sp4/sp4-favlinks-pv/public/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'sp');
        break;

    //Define WP urls
    case 'dev-www.library.miami.edu':
        define('SITE_URL', 'http://dev-www.library.miami.edu');
        define('CONF_PATH', '/subversion/www/html/devel/dev-non-svn/rails_projects/sp4dev-staging-afc/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'wp');
        break;

//    case 'library.mssssssiami.edu':
//        define('SITE_URL', 'http://sp4.local');
//        break;
//
    case 'localhost/richter':
        define('SITE_URL', 'http://localhost/richter');
        define('CONF_PATH', '/Applications/MAMP/htdocs/sp4/sp4-favlinks-pv/public/addons/favoritelinks/conf/json/');
        define('SITE_TYPE', 'wp');
        break;
}