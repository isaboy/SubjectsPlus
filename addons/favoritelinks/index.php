<?php
header('Access-Control-Allow-Origin: *');
include('conf/config-local.php');

$site = SITE_URL;
$conf_folder_path = CONF_PATH;
$site_type = SITE_TYPE;

$json = file_get_contents($conf_folder_path . 'conf.json');
$sitesConfJson = json_decode($json);
$siteConfigurations = $sitesConfJson->$site_type->sites;
$siteMarkupClasses = json_encode($sitesConfJson->$site_type->siteMarkupClasses);
$minimunItemsForSearchBar = $sitesConfJson->minimumItemsCountForSearchBar;
foreach ($siteConfigurations as $siteConf) {
    if (strcmp($siteConf->origin, $site) === 0) {
        $origin = $site;
        $sendTo = $siteConf->sendTo;
        $acceptFrom = $siteConf->acceptFrom;
        $environment = $siteConf->environment;
        break;
    }
}

$siteConfigurations = json_encode($sitesConfJson->$site_type->sites);
$defaultLinks = file_get_contents($conf_folder_path . 'defaultLinks.json');
?>

<?php if (strcmp($site_type, "sp") === 0) { ?>
    <script src="//adobe-accessibility.github.io/Accessible-Mega-Menu/js/jquery-accessibleMegaMenu.js">
    </script>
<?php } ?>

<script>
    var insideIFrame = window.self !== window.top;
    var refererJS = document.referrer;
    var thisSite = '<?php echo $site_type?>';
    var origin = '<?php echo $origin?>';
    var siteMarkupClasses = <?php echo $siteMarkupClasses?>;
    var minimumItemsCountForSearchBar = <?php echo $minimunItemsForSearchBar?>;
    var sendTo = '<?php echo $sendTo?>';
    var acceptFrom = '<?php echo $acceptFrom?>';
    var defaultLinks = <?php echo $defaultLinks?>;

    if (insideIFrame && refererJS.includes(origin)){ //Is an sp site inside an iFrame in Wordpress, let's fix it
        var environment = '<?php echo $environment ?>';
        var sitesConfJson = <?php echo json_encode($sitesConfJson) ?>;

        var spSites = sitesConfJson.sp.sites;

        for (var i = 0; i < spSites.length; i++){
            var site = spSites[i];

            if ("environment" in site) {
                if (site.environment === environment){
                    thisSite = "sp";
                    origin = site.origin;
                    sendTo = site.sendTo;
                    acceptFrom = site.acceptFrom;
                }
            }
        }
    }

    <?php include('js/favoritelinks.js'); ?>
    var fdl = favoriteDatabasesList();
    fdl.init();

</script>

<style>
    <?php include('css/favoritelinks.css'); ?>
</style>