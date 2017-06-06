
function favoriteDatabasesList() {
    var conf_url = "";
    var minimumItemsCountForSearchBar = "";
    var defaultLinks = "";
    var trusted_urls = "";
    var isWordpress = "";
    var isInIFrame = "";
    var previouslyLoggedIn = false;
    var dialogBoxOpened = false;
    var umlibrary_favorite_links = {
        init: function () {
            isWordpress = parseInt(umlibrary_favorite_links.getParamFromUrl('wordpress'));
            isInIFrame = parseInt(umlibrary_favorite_links.getParamFromUrl('iframe'));
            umlibrary_favorite_links.setEnvironment();

            $.ajax({
                url: conf_url,
                type: 'GET',
                success: function(data){
                    data = JSON.parse(data);
                    minimumItemsCountForSearchBar = data.minimumItemsCountForSearchBar;
                    defaultLinks = data.default_links;
                    trusted_urls = data.trusted_urls;

                    if (typeof php_vars !== 'undefined') {
                        isWordpress = parseInt(php_vars.wordpress);
                    }

                    if (!isInIFrame) {
                        umlibrary_favorite_links.prepareUI();

                        if (!isWordpress) {
                            umlibrary_favorite_links.includeVendorsJSAndCSS();
                        }

                        umlibrary_favorite_links.bindUIActions();
                        umlibrary_favorite_links.createDefaultListOfLinks();
                        umlibrary_favorite_links.detectLocalStorageChange();

                        window.onbeforeunload = function (event) {
                            umlibrary_favorite_links.logOutFromGoogle(false);
                        };
                    }
                    umlibrary_favorite_links.setCommunications();
                },
                error: function(data) {
                    console.log(data);
                }
            });
        },
        setEnvironment: function () {
            var environment = 'local'; //local, development, production

            switch(environment) {
                case 'local':
                    conf_url =  '//sp4.local/addons/favoritelinks/conf/json/conf.php';
                    break;
                case 'development':
                    conf_url = '//development.library.miami.edu/fav/addons/favoritelinks/conf/json/conf.php';
                    break;
                case 'production':
                    conf_url =  '//sp.library.miami.edu/addons/favoritelinks/conf/json/conf.php';
                    break;
            }
        },
        includeVendorsJSAndCSS: function () {
            var googlePlatform = document.createElement('script');
            googlePlatform.src = '//apis.google.com/js/platform.js';
            document.head.appendChild(googlePlatform);

            var googleClient = document.createElement('script');
            googleClient.src = '//apis.google.com/js/client.js';
            document.head.appendChild(googleClient);
        },
        prepareUI: function () {
            umlibrary_favorite_links.addFavoriteLinksButtonToAccountsMenu();

            if (isWordpress) {
                umlibrary_favorite_links.addFavoriteButtonToHeader();
                umlibrary_favorite_links.addFavoriteButtonToMainPage();
            }

            umlibrary_favorite_links.createFavoriteLinksModal();
            umlibrary_favorite_links.setFavorites();
            umlibrary_favorite_links.addLinkToFavorites();
            umlibrary_favorite_links.exportFavoritesList();
            umlibrary_favorite_links.importFavorites();
            umlibrary_favorite_links.favoritesListInput();
        },
        addFavoriteButtonToMainPage: function () {
            var selector = "quicko";
            var container = document.getElementById(selector);

            var myFavoriteLibraryLinks = document.createElement('a');
            myFavoriteLibraryLinks.setAttribute('class', 'umlibrary_favorite_links_button fav-links-prompt-home');
            myFavoriteLibraryLinks.text = 'Add your own Favorite Links';

            container.appendChild(myFavoriteLibraryLinks);
        },
        addFavoriteLinksButtonToAccountsMenu: function () {
            var selector = "favorite-links-menu-container";
            var container = document.getElementById(selector);

            var favoriteListInput = document.createElement('input');
            favoriteListInput.setAttribute('id', 'favoritesListInput');
            favoriteListInput.setAttribute('type', 'file');

            var myFavoriteLibraryLinks = document.createElement('a');
            myFavoriteLibraryLinks.setAttribute('class', 'umlibrary_favorite_links_button');
            myFavoriteLibraryLinks.text = 'My Favorite Links';

            container.appendChild(favoriteListInput);
            container.appendChild(myFavoriteLibraryLinks);
        },
        addFavoriteButtonToHeader: function () {
            var header = document.getElementsByClassName("page-header")[0];
            if (header) {
                var button = document.createElement('button');
                button.className = "fa fa-star-o fa-3 umlibrary-favorite-button";
                $(header).append(button);
            }
        },
        createFavoriteLinksModal: function () {
            var modal = document.createElement('div');
            modal.setAttribute("id", "favorite-links-modal-window");
            modal.setAttribute("tabindex", -1);

            var modalContent = document.createElement('div');
            modalContent.setAttribute("id", "favorite-links-modal-window-content");
            modalContent.className= 'modal-content';
            modal.appendChild(modalContent);
            document.body.appendChild(modal);

            var modalHeaderBar = document.createElement('div');
            modalHeaderBar.className= 'modal-header';
            var modalHeaderTitle = document.createElement('h2');

            var starClosed = document.createElement('i');
            starClosed.setAttribute("class", "fa fa-star");
            modalHeaderTitle.appendChild(starClosed);

            modalHeaderTitle.appendChild(document.createTextNode('My Favorite Links'));
            modalHeaderBar.appendChild(modalHeaderTitle);
            modalContent.appendChild(modalHeaderBar);

            modalHeaderBar.appendChild(umlibrary_favorite_links.generateModalCloseButton($(modalHeaderBar).parent().parent(), "favorite-links-modal-close-button"));

            umlibrary_favorite_links.createLeftSideOfModal(modalContent);
            umlibrary_favorite_links.createRightSideOfModal(modalContent);
        },
        createLeftSideOfModal: function(modalContent){
            var leftDiv = document.createElement('div');
            leftDiv.id = 'quick-links-modal-window-left-div';
            leftDiv.className = 'quick-links-modal-window-column';
            modalContent.appendChild(leftDiv);

            umlibrary_favorite_links.createSearchBar(leftDiv);            

            var divList = document.createElement("div");
            divList.id = "favorite-links-modal-window-content-list";
            leftDiv.appendChild(divList);

            var divOptionsMenu = document.createElement('nav');
            divOptionsMenu.id = 'favorite-links-options-menu';

            var ul = document.createElement('ul');
            ul.className = 'fl-nav-menu';

            umlibrary_favorite_links.createSaveLinksDropDownMenu(ul);
            umlibrary_favorite_links.createLoadLinksDropDownMenu(ul);

            divOptionsMenu.appendChild(ul);

            leftDiv.appendChild(divOptionsMenu);

        },
        createSearchBar: function (container) {
            var searchBar = document.createElement('input');
            searchBar.type = "text";
            searchBar.id = "favoriteLinksSearchBar";
            searchBar.placeholder = "Find in my favorite links";
            searchBar.style.display = 'none';

            var searchBarDiv = document.createElement('div');
            searchBarDiv.id = 'searchBarContainer';
            searchBarDiv.appendChild(searchBar);
            container.appendChild(searchBarDiv);

            if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                if (favorites.length > minimumItemsCountForSearchBar) {
                    $(searchBar).show();
                }
            }
        },
        divIsVisible: function (div) {
            var style = window.getComputedStyle(div);
            return (style.display !== 'none');
        },
        createRightSideOfModal: function(modalContent){
            var rightDiv = document.createElement('div');
            rightDiv.id = 'quick-links-modal-window-right-div';
            rightDiv.className = 'quick-links-modal-window-column';
            modalContent.appendChild(rightDiv);

            umlibrary_favorite_links.favoriteLinksModalHeader(rightDiv);
            umlibrary_favorite_links.createQuickLinksDescription(rightDiv);
        },
        favoriteLinksModalHeader: function (container) {
            var favoriteListInput = document.createElement('input');
            favoriteListInput.setAttribute('id', 'favoritesListInput');
            favoriteListInput.setAttribute('type', 'file'); 

            container.appendChild(favoriteListInput);
        },
        createSaveLinksDropDownMenu: function (ul) {
            var saveLinksNavItem = document.createElement('li');
            saveLinksNavItem.className = 'fl-nav-item backup-list';

            var saveLinksAnchor = document.createElement('a');
            saveLinksAnchor.href='';
            saveLinksAnchor.appendChild(document.createTextNode('Back Up List'));

            var divSubNav = document.createElement('div');
            divSubNav.className = "fl-sub-nav";

            var ulSubNavGroup = document.createElement('ul');
            ulSubNavGroup.className = "fl-sub-nav-group";

            var liSaveLocal = document.createElement("li");

            var saveFavorites = document.createElement('a');
            saveFavorites.href='';
            saveFavorites.setAttribute('id', 'umlibrary_favorite_links_save_favorites_button');
            saveFavorites.className = 'umlibrarysurvey-favorites-actions';
            saveFavorites.text = 'Back up to local drive';

            var saveToLocalIcon = document.createElement('i');
            saveToLocalIcon.className = "fa fa-hdd-o fa-3";

            liSaveLocal.appendChild(saveToLocalIcon);
            liSaveLocal.appendChild(saveFavorites);

            var liSaveToDrive = document.createElement("li");

            var saveFavoritesToDrive = document.createElement('a');
            saveFavoritesToDrive.href='';
            saveFavoritesToDrive.setAttribute('id', 'umlibrary_favorite_links_save_to_drive_button');
            saveFavoritesToDrive.className = 'umlibrarysurvey-favorites-actions';
            saveFavoritesToDrive.text = 'Back up to Google Drive';

            var saveToDriveIcon = document.createElement('i');
            saveToDriveIcon.className = "fa fa-cloud-upload fa-3";

            liSaveToDrive.appendChild(saveToDriveIcon);
            liSaveToDrive.appendChild(saveFavoritesToDrive);

            ulSubNavGroup.appendChild(liSaveLocal);
            ulSubNavGroup.appendChild(liSaveToDrive);
            saveLinksNavItem.appendChild(saveLinksAnchor);
            divSubNav.appendChild(ulSubNavGroup);
            saveLinksNavItem.appendChild(saveLinksAnchor);
            saveLinksNavItem.appendChild(divSubNav);

            ul.appendChild(saveLinksNavItem);
        },
        createLoadLinksDropDownMenu: function (ul) {
            var loadLinksNavItem = document.createElement('li');
            loadLinksNavItem.className = 'fl-nav-item import-list';

            var loadLinksAnchor = document.createElement('a');
            loadLinksAnchor.href='';
            loadLinksAnchor.appendChild(document.createTextNode('Import List'));

            var divSubNav = document.createElement('div');
            divSubNav.className = "fl-sub-nav";

            var ulSubNavGroup = document.createElement('ul');
            ulSubNavGroup.className = "fl-sub-nav-group";

            var liLoadLocal = document.createElement("li");

            var loadFavorites = document.createElement('a');
            loadFavorites.href='';
            loadFavorites.setAttribute('id', 'umlibrary_favorite_links_load_favorites_button');
            loadFavorites.className = 'umlibrarysurvey-favorites-actions';
            loadFavorites.text = 'Import from local drive';

            var loadFromLocalIcon = document.createElement('i');
            loadFromLocalIcon.className = "fa fa-hdd-o fa-3";

            liLoadLocal.appendChild(loadFromLocalIcon);
            liLoadLocal.appendChild(loadFavorites);

            var liLoadFromDrive = document.createElement("li");

            var loadFavoritesFromDrive = document.createElement('a');
            loadFavoritesFromDrive.href='';
            loadFavoritesFromDrive.setAttribute('id', 'umlibrary_favorite_links_load_from_drive_button');
            loadFavoritesFromDrive.className = 'umlibrarysurvey-favorites-actions';
            loadFavoritesFromDrive.text = 'Import from Google Drive';

            var loadFromDriveIcon = document.createElement('i');
            loadFromDriveIcon.className = "fa fa-cloud-download fa-3";

            liLoadFromDrive.appendChild(loadFromDriveIcon);
            liLoadFromDrive.appendChild(loadFavoritesFromDrive);

            ulSubNavGroup.appendChild(liLoadLocal);
            ulSubNavGroup.appendChild(liLoadFromDrive);
            loadLinksNavItem.appendChild(loadLinksAnchor);
            divSubNav.appendChild(ulSubNavGroup);
            loadLinksNavItem.appendChild(loadLinksAnchor);
            loadLinksNavItem.appendChild(divSubNav);

            ul.appendChild(loadLinksNavItem);
        },
        detectLocalStorageChange: function () {
            $(window).bind('storage', function (e) {
                umlibrary_favorite_links.setFavorites();
                $("#favorite-links-modal-window").hide();
                if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                    var favorites = JSON.parse(localStorage.umLibraryFavorites);
                    if (favorites.length > minimumItemsCountForSearchBar) {
                        $('#favoriteLinksSearchBar').show();
                    }else{
                        $('#favoriteLinksSearchBar').hide();
                    }
                }else{
                    $('#favoriteLinksSearchBar').hide();
                }
            });
        },
        bindUIActions: function () {
            umlibrary_favorite_links.favoriteLinksSearchBarBehavior();
            umlibrary_favorite_links.myFavoriteLinksButtonBehavior();
            umlibrary_favorite_links.saveToGoogleDriveButtonBehavior();
            umlibrary_favorite_links.loadFromGoogleDriveButtonBehavior();
            umlibrary_favorite_links.enableAccessibiliyHandler();
        },
        enableAccessibiliyHandler: function (){
            var url = "//adobe-accessibility.github.io/Accessible-Mega-Menu/js/jquery-accessibleMegaMenu.js";
            if (!isWordpress){
                $.getScript( url, function() {
                    umlibrary_favorite_links.setAccessibilitySettings();
                });
            }else{
                umlibrary_favorite_links.setAccessibilitySettings();
            }
        },
        setAccessibilitySettings: function () {
            $("#favorite-links-options-menu:first").accessibleMegaMenu({
                /* prefix for generated unique id attributes, which are required
                 to indicate aria-owns, aria-controls and aria-labelledby */
                uuidPrefix: "fl-accessible-megamenu",

                /* css class used to define the megamenu styling */
                menuClass: "fl-nav-menu",

                /* css class for a top-level navigation item in the megamenu */
                topNavItemClass: "fl-nav-item",

                /* css class for a megamenu panel */
                panelClass: "fl-sub-nav",

                /* css class for a group of items within a megamenu panel */
                panelGroupClass: "fl-sub-nav-group",

                /* css class for the hover state */
                hoverClass: "hover",

                /* css class for the focus state */
                focusClass: "focus",

                /* css class for the open state */
                openClass: "open"
            });
        },
        filterTagBehavior: function () {
            $(".umlibrary-favorite-links-filter-tag-checkbox").click(function () {
                $('.umlibrary-favorite-links-filter-tag-checkbox').not(this).prop('checked', false);
                var filterTag = $(".umlibrary-favorite-links-filter-tag-checkbox:checkbox:checked").parent().text();

                if (filterTag) {
                    $('ul#favoriteLinksModalWindowList li:not(li[filtertag=' + filterTag + '])').hide();
                    $('ul#favoriteLinksModalWindowList li[filtertag=' + filterTag + ']').show();
                } else {
                    $('ul#favoriteLinksModalWindowList li[filtertag]').show();
                }
            })
        },
        createDefaultListOfLinks: function () {
            if ($.isEmptyObject(localStorage.umLibraryFavorites)) {
                localStorage.umLibraryFavorites = "[]";
                for (var i = 0; i < defaultLinks.length; i++){
                    var link = defaultLinks[i];
                    umlibrary_favorite_links.saveFavoritesToLocalStorage(link.linkName, link.urlLink, link.tag, false);
                }
            }
        },
        setFavorites: function () {
            if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                var len = favorites.length;

                $(".umlibrary-favorite-button").each(function () {
                    var urlLink = document.URL;

                    if (len == 0){
                        umlibrary_favorite_links.unmarkAsFavorite(this);
                    }else {
                        for (var i = 0; i < len; i++) {
                            if (favorites[i].urlLink == urlLink) {
                                umlibrary_favorite_links.markAsFavorite(this);
                                break;
                            } else {
                                umlibrary_favorite_links.unmarkAsFavorite(this);
                            }
                        }
                    }
                });

                $(".favorite-database-icon").each(function () {
                    var anchor = $(this).parent().parent().parent().find("a")[0];
                    var urlLink = $(anchor).attr('href');

                    if (len == 0){
                        umlibrary_favorite_links.unmarkAsFavorite(this);
                    }else {
                        for (var i = 0; i < len; i++) {
                            if (favorites[i].urlLink == urlLink) {
                                umlibrary_favorite_links.markAsFavorite(this);
                                break;
                            } else {
                                umlibrary_favorite_links.unmarkAsFavorite(this);
                            }
                        }
                    }
                })
            }
        },
        addLinkToFavorites: function () { //add link to UM favorites using HTML5 localStorage
            $(".umlibrary-favorite-button, .favorite-database-icon").click(function () {
                if (typeof(Storage) !== "undefined") {
                    var linkName, urlLink;
                    var deleting = false;

                    if ($.isEmptyObject(localStorage.umLibraryFavorites)) {
                        localStorage.umLibraryFavorites = "[]";
                    }

                    if ($(this).hasClass("fa-star-o")) {
                        //mark as favorite
                        umlibrary_favorite_links.markAsFavorite(this);
                    } else {
                        //unmark as favorite
                        $(this).removeClass("fa-star");
                        $(this).addClass("fa-star-o");
                        deleting = true;
                    }

                    if ($(this).hasClass("favorite-database-icon")) {
                        var anchor = $(this).parent().parent().parent().find("a")[0];

                        linkName = $(anchor).text();
                        urlLink = $(anchor).attr('href');
                        if (!deleting) {
                            umlibrary_favorite_links.saveFavoritesToLocalStorage(linkName, urlLink, 'Databases', true);
                        }
                    }else{
                        linkName = document.getElementsByTagName("title")[0].innerHTML;
                        urlLink = document.URL;
                        if (!deleting) {
                            umlibrary_favorite_links.saveFavoritesToLocalStorage(linkName, urlLink, 'Pages', true);
                        }
                    }

                    if (deleting) {
                        umlibrary_favorite_links.deleteFavoritesFromLocalStorage(linkName, urlLink);
                    }
                }
            })
        },
        markAsFavorite: function (button) {
            $(button).removeClass("fa-star-o");
            $(button).addClass("fa-star");
        },
        unmarkAsFavorite: function (button) {
            $(button).removeClass("fa-star");
            $(button).addClass("fa-star-o");
        },
        saveFavoritesToLocalStorage: function (linkName, urlLink, tag, propagate) {
            if (linkName.indexOf("|") >= 0){
                linkName = linkName.split("|")[0];
            }

            var favorites = JSON.parse(localStorage.umLibraryFavorites);
            favorites.push({"linkName": linkName, "urlLink": urlLink, "tag": tag});
            localStorage.umLibraryFavorites = JSON.stringify(favorites);
            if (propagate) {
                umlibrary_favorite_links.propagateFavorites();
            }
        },
        deleteFavoritesFromLocalStorage: function (linkName, urlLink) {
            var toDelete = {"linkName": linkName, "urlLink": urlLink};
            var favorites = JSON.parse(localStorage.umLibraryFavorites);
            var position = -1;
            for (var i = 0, len = favorites.length; i < len; i = i + 1) {
                if (favorites[i].linkName == toDelete.linkName && favorites[i].urlLink == toDelete.urlLink) {
                    position = i;
                    break;
                }
            }
            if (position != -1) {
                if (position == 0 && len == 1){
                    favorites.shift();
                }else{
                    favorites.splice(position, 1);
                }
            }
            localStorage.umLibraryFavorites = JSON.stringify(favorites);
            if (favorites.length < minimumItemsCountForSearchBar) {
                $('#favoriteLinksSearchBar').hide();
            }
            umlibrary_favorite_links.propagateFavorites();
        },
        exportFavoritesList: function () {
            $("#umlibrary_favorite_links_save_favorites_button").click(function (event) {
                    event.preventDefault();
                    if (typeof(Storage) !== "undefined") {
                        if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                            if (umlibrary_favorite_links.getInternetExplorerVersion() != 0) {
                                umlibrary_favorite_links.saveOnInternetExplorer();
                            } else {
                                umlibrary_favorite_links.saveOnDisk();
                            }
                            dialogBoxOpened = true;
                        }
                    }
                }
            )
        },
        getInternetExplorerVersion: function () {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf("MSIE ");

            if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))
                return parseInt(ua.substring(msie + 5, ua.indexOf(".", msie)));
            else
                return 0

        },
        saveOnInternetExplorer: function () {
            var blobObject = new Blob([localStorage.umLibraryFavorites]);
            window.navigator.msSaveBlob(blobObject, 'umLibraryFavorites');
        },
        saveOnDisk: function () {
            var favorites = localStorage.umLibraryFavorites;
            var uriContent = "data:application/octet-stream," + encodeURIComponent(favorites);
            var link = document.createElement('a');
            if (typeof link.download === 'string') {
                link.href = uriContent;
                link.setAttribute('download', "umLibraryFavorites");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                window.open(uriContent);
            }
        },
        importFavorites: function () {
            $("#umlibrary_favorite_links_load_favorites_button").click(function (event) {
                    event.preventDefault();
                    $('#favoritesListInput').trigger('click');
                }
            );
        },
        favoritesListInput: function () {
            $("#favoritesListInput").change(function (event) {
                var files = event.target.files;
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        try {
                            var favorites = JSON.parse(e.target.result);
                            umlibrary_favorite_links.iterateFavoritesList(favorites);
                        } catch (e) {
                            alert('The favorites list file is either corrupted or wrong!');
                        }
                    };
                    reader.readAsText(files[0]);
                }
            );
        },
        iterateFavoritesList: function (favorites) {
            try {
                for (var i = 0, len = favorites.length; i < len; i++) {
                    var objectLength = Object.keys(favorites[i]).length;
                    if (objectLength != 3) {
                        throw 'error';
                    } else if (!('linkName' in favorites[i]) && !('urlLink' in favorites[i]) && !('tag' in favorites[i])) {
                        throw 'error';
                    }
                }
                localStorage.umLibraryFavorites = JSON.stringify(favorites);
                umlibrary_favorite_links.propagateFavorites();
                umlibrary_favorite_links.logOutFromGoogle(true);
            } catch (e) {
                alert('The favorites list file is either corrupted or wrong!');
            }
        },
        myFavoriteLinksButtonBehavior: function () {
            $(".umlibrary_favorite_links_button").click(function (event) {
                $(window).on({
                    'scroll mousewheel touchmove': function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                });
                $(window).on({
                    'keydown': function(e) {
                        var left = 37, up = 38, right = 39, down = 40;

                        if ((e.keyCode == left || e.keyCode == up || e.keyCode == right || e.keyCode == down) && document.activeElement != document.getElementById('favoriteLinksSearchBar') && e.keyCode != 27){
                            e.preventDefault();
                            e.stopPropagation();
                        }

                        if (e.keyCode == 27){
                            $(window).off('scroll mousewheel touchmove keydown');
                        }
                    }
                });
                umlibrary_favorite_links.fillLinksList();
                var modal = document.getElementById("favorite-links-modal-window");
                modal.style.display = "block";
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                if (favorites.length > minimumItemsCountForSearchBar) {
                    document.querySelector('#favoriteLinksSearchBar').style.display= 'inline-block';
                    document.querySelector('#favoriteLinksSearchBar').focus();
                }else{
                    document.querySelector('#favorite-links-modal-window').focus();
                }
                umlibrary_favorite_links.setFocusableElementsBehavior("favorite-links-modal-window");
            });

        },
        loadFromGoogleDriveButtonBehavior: function () {
            $("#umlibrary_favorite_links_load_from_drive_button").click(function (event) {
                event.preventDefault();
                umlibrary_favorite_links.checkIfPreviouslyLoggedIn();
                gapi.auth.authorize(
                    {
                        client_id: '672115995478-ujjhjeuovnjc6nva3cuh9ntg645294sn.apps.googleusercontent.com',
                        scope: ['https://www.googleapis.com/auth/drive.file'],
                        immediate: false
                    },
                    function (authResult) {
                        umlibrary_favorite_links.googleAuthorization("load", authResult);
                    })
            });
        },
        checkIfPreviouslyLoggedIn: function () {
            var sessionParams = {
                'client_id': '672115995478-ujjhjeuovnjc6nva3cuh9ntg645294sn.apps.googleusercontent.com',
                'session_state': null
            };
            gapi.auth.checkSessionState(sessionParams, function (stateMatched) {
                if (stateMatched == false) {
                    previouslyLoggedIn = true;
                }
            });
        },
        googleAuthorization: function (action, authResult) {
            if (authResult && !authResult.error) {
                gapi.client.load('drive', 'v3', function () {
                    switch (action) {
                        case 'load':
                            umlibrary_favorite_links.loadFilesFromGoogleDrive();
                            break;
                        case 'save':
                            umlibrary_favorite_links.saveFileToGoogleDrive();
                            break;
                    }

                });
            }
        },
        loadFilesFromGoogleDrive: function () {
            //Here is where the loading magic happens!!!!
            var request = gapi.client.drive.files.list({
                'q': "appProperties has { key='umlibraryfile' and value='umlibrary-favorite-links-file' }",
                'fields': "nextPageToken, files(id, name)"
            });
            request.execute(function (resp) {
                var files = resp.files;
                if (files && files.length > 0) {
                    var file = files[0];
                    umlibrary_favorite_links.getFileInformationFromGoogleDrive(file.id);
                } else {
                    alert('Sorry, there is no saved Favorite Links file');
                }
            });
        },
        getFileInformationFromGoogleDrive: function (fileId) {
            var request = gapi.client.drive.files.get({
                'fileId': fileId,
                'alt': 'media'
            });
            request.execute(function (resp) {
                umlibrary_favorite_links.iterateFavoritesList(resp);
            });
        },
        logOutFromGoogle: function (reload) {
            if (!previouslyLoggedIn) {
                var frame = document.createElement('iframe');
                frame.setAttribute('src', 'https://accounts.google.com/logout');
                frame.style.display = "none";
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(frame);
            }

            if (reload === true) {
                setTimeout(
                    function () {
                        location.reload();
                    }, 1500);
            }
        },
        saveToGoogleDriveButtonBehavior: function () {
            $("#umlibrary_favorite_links_save_to_drive_button").click(function (event) {
                event.preventDefault();
                umlibrary_favorite_links.checkIfPreviouslyLoggedIn();
                gapi.auth.authorize(
                    {
                        client_id: '672115995478-ujjhjeuovnjc6nva3cuh9ntg645294sn.apps.googleusercontent.com',
                        scope: ['https://www.googleapis.com/auth/drive.file'],
                        immediate: false
                    },
                    function (authResult) {
                        umlibrary_favorite_links.googleAuthorization("save", authResult);
                    })
            });
            return false;
        },
        saveFileToGoogleDrive: function () {
            var request = gapi.client.request({
                'path': '/drive/v3/files',
                'method': 'POST',
                'body': {
                    "name": "favorite links.json",
                    "mimeType": "application/json",
                    "appProperties": {'umlibraryfile': 'umlibrary-favorite-links-file'}
                }
            });
            request.execute(function (resp) {
                gapi.client.request({
                    'path': '/upload/drive/v3/files/' + resp.id,
                    'params': {'uploadType': 'media'},
                    'method': 'PATCH',
                    'body': localStorage.umLibraryFavorites,
                    callback: function (response) {
                        var saveButton = document.getElementById('umlibrary_favorite_links_save_to_drive_button')
                        saveButton.innerHTML = "";
                        saveButton.appendChild(document.createTextNode('Saved to Google Drive!'));
                        saveButton.removeAttribute('id');
                        saveButton.className = "umlibrary-favorite-links-action-completed";
                        umlibrary_favorite_links.logOutFromGoogle(false);
                    }
                });
            });
        },
        createQuickLinksDescription: function(rightDiv){
            var header = document.createElement('h3');
            header.appendChild(document.createTextNode("What are My Favorite Links?"));

            var description = document.createElement('p');
            description.appendChild(document.createTextNode("Favorite Links are a way of storing your most frequented pages or databases without logging in. They are tied to your computer and your web browser, so they will disappear if you clear your cache or use another computer."));

            var header2 = document.createElement('h3');
            header2.appendChild(document.createTextNode("How to use this feature"));

            var instructionsList = document.createElement('ul');
            
            var instructionsItem1 = document.createElement('li');
            instructionsItem1.appendChild(document.createTextNode("Add a favorite link by clicking on the open star icon"));
            
            var starOpen = document.createElement('i');
            starOpen.setAttribute("class", "fa fa-star-o");
            instructionsItem1.appendChild(starOpen);

            var instructionsItem2 = document.createElement('li');
            instructionsItem2.appendChild(document.createTextNode("Your favorite links will display the colored star icon"));

            var starClosed = document.createElement('i');
            starClosed.setAttribute("class", "fa fa-star");
            instructionsItem2.appendChild(starClosed);


            var instructionsItem3 = document.createElement('li');
            instructionsItem3.appendChild(document.createTextNode("Find your favorite links under the Accounts+ Menu"));

            instructionsList.appendChild(instructionsItem1);
            instructionsList.appendChild(instructionsItem2);
            instructionsList.appendChild(instructionsItem3);

            var header3 = document.createElement('h3');
            header3.appendChild(document.createTextNode("How to back up your Favorite Links"));

            var description2 = document.createElement('p');
            description2.appendChild(document.createTextNode("Your favorite links are automatically stored once you click the star, however if you have saved a lot of links and want to transfer them to a new computer (or like to clean your browser cache a lot), you can use the Back Up List and Import List functionality."));
            var note = document.createElement('p');
            note.appendChild(document.createTextNode("Favorite links can be backed up to your local computer or Google Drive."));


            rightDiv.appendChild(header);
            rightDiv.appendChild(description);
            rightDiv.appendChild(header2);
            rightDiv.appendChild(instructionsList);
            rightDiv.appendChild(header3);
            rightDiv.appendChild(description2);
            rightDiv.appendChild(note);

        },
        generateModalCloseButton: function (parentToClose, id) {
            var close = document.createElement('button');
            if (id){
                close.setAttribute("id", id);
            }
            close.className = "favorite-links-modal-window-close-button";
            close.setAttribute("title", "Close");

            $(close).click(function (event) {
                $(window).off('scroll mousewheel touchmove keydown');
                $(parentToClose).hide();

            });
            close.appendChild(document.createTextNode("x"));
            return close;
        },
        setFocusableElementsBehavior: function (currentModal) {
            $("#" + currentModal + " :focusable").each(function () {
                var element = $(this);
                element.keydown(function (event) {
                    var currentElement = $(this)[0];
                    var focusables = $("#" + currentModal + " :focusable");
                    if (focusables.length > 0) {
                        var firstFocusable = focusables[0];
                        var lastFocusable = focusables[focusables.length - 1];

                        if (currentElement === firstFocusable && event.keyCode == 9 && event.shiftKey) {
                            event.preventDefault();
                            $(lastFocusable).focus();
                        } else if (currentElement === lastFocusable && event.keyCode == 9 && !event.shiftKey) {
                            event.preventDefault();
                            $(firstFocusable).focus();
                        }
                    }
                });
            });

            $("#" + currentModal).keyup(function(e) { //TO Do function to call to when closing things
                if (e.keyCode == 27) {
                    if (!dialogBoxOpened) {
                        $(this).hide();
                        $(window).off('scroll mousewheel touchmove keydown');
                    }
                }
            });
        },
        isLocalStorageValid: function () {
            if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                return true;
            }
            return false;
        },
        fillLinksList: function () {
            var modalContent = document.getElementById("favorite-links-modal-window-content-list");
            if (localStorage.umLibraryFavorites) {
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                if (favorites.length > 0) {
                    var fieldset = document.createElement('fieldset');
                    fieldset.className = "umlibrary-favorite-links-filterby-fieldset";
                    var legend = document.createElement('legend').appendChild(document.createTextNode('Show:'));
                    fieldset.appendChild(legend);
                    fieldset.style.display = 'none';

                    if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                        favorites = JSON.parse(localStorage.umLibraryFavorites);
                        if (favorites.length > minimumItemsCountForSearchBar) {
                            $(fieldset).show();
                        }
                    }

                    var list = document.createElement('ul');
                    list.id = "favoriteLinksModalWindowList";
                    list.setAttribute('overflow', 'auto');

                    var tags = [];
                    for (var i = 0, len = favorites.length; i < len; i++) {
                        var linkName = favorites[i].linkName;
                        var urlLink = favorites[i].urlLink;
                        var tag = favorites[i].tag;

                        if (tags.indexOf(tag) < 0) {
                            tags.push(tag);

                            var tagLabel = document.createElement('label');
                            tagLabel.className = "umlibrary-favorite-links-filter-tag";
                            var input = document.createElement('input');
                            input.type = "checkbox";
                            input.className = "umlibrary-favorite-links-filter-tag-checkbox";

                            tagLabel.appendChild(input);
                            tagLabel.appendChild(document.createTextNode(tag));
                            fieldset.appendChild(tagLabel);
                        }

                        var a = document.createElement('a');
                        a.text = linkName;
                        a.href = urlLink;
                        a.target = "_blank";
                        a.className = "umlibrary-favorite-links-anchor";

                        var remove = document.createElement('button');
                        remove.className = "fa fa-trash";

                        $(remove).click(function (event) {
                            umlibrary_favorite_links.removeFavoriteFromList($(this).parent());
                            umlibrary_favorite_links.setFavorites();
                        });

                        var favIcon = document.createElement('img');
                        var scrubbedURL = urlLink;
                        if (scrubbedURL.indexOf("http://access.library.miami.edu/login?url=") >= 0){
                            scrubbedURL =scrubbedURL.split("http://access.library.miami.edu/login?url=", 2)[1];
                        }

                        if (scrubbedURL.indexOf("?") >= 0){
                            scrubbedURL =scrubbedURL.split("?", 2)[0];
                        }
                        favIcon.src = "https://www.google.com/s2/favicons?domain_url=" + scrubbedURL;

                        var li = document.createElement('li');

                        li.className = "umlibrary-list-item";
                        li.setAttribute('filtertag', tag);
                        li.appendChild(favIcon);
                        li.appendChild(a);
                        li.appendChild(remove);

                        list.appendChild(li);
                    }
                    modalContent.innerHTML = "";
                    modalContent.appendChild(fieldset);
                    modalContent.appendChild(list);
                    umlibrary_favorite_links.filterTagBehavior();                    
                } else{
                    modalContent.innerHTML="";
                    modalContent.appendChild(document.createTextNode("Looks like you haven't set any favorite links yet"));
                }
            }else{
                modalContent.innerHTML="";
                modalContent.appendChild(document.createTextNode("Looks like you haven't set any favorite links yet"));
            }
            
        },
        removeFavoriteFromList: function (listItem) {
            var anchor = $(listItem).find('a')[0];
            umlibrary_favorite_links.deleteFavoritesFromLocalStorage($(anchor).text(), $(anchor).attr('href'));
            $(listItem).remove();
        },
        favoriteLinksSearchBarBehavior: function () {
            $('#favoriteLinksSearchBar').keyup(function () {
                umlibrary_favorite_links.filterList();
            });
        },
        filterList: function () {
            var input, filter, ul, li, filterTag;
            input = document.getElementById("favoriteLinksSearchBar");
            filter = input.value.toLowerCase();
            filterTag = $(".umlibrary-favorite-links-filter-tag-checkbox:checkbox:checked").parent().text();
            ul = document.getElementById("favoriteLinksModalWindowList");
            if (ul) {
                li = filterTag ? $("[filtertag=" + filterTag + "]") : ul.getElementsByTagName("li");
                for (var i = 0; i < li.length; i++) {
                    var a = li[i].getElementsByTagName("a")[0];
                    if (a.innerHTML.toLowerCase().indexOf(filter) > -1) {
                        li[i].style.display = "";
                    } else {
                        li[i].style.display = "none";
                    }
                }
            }
        },
        setCommunications: function () {
            if (!isInIFrame) {
                umlibrary_favorite_links.setSendFrame();
            }else{
                umlibrary_favorite_links.setReceive();
            }
        },
        setSendFrame: function () {
            for (var i = 0; i < trusted_urls.length; i = i +1){
                var url = trusted_urls[i];
                var urlDomain = umlibrary_favorite_links.getUrlDomain(url);
                var currentDomain = umlibrary_favorite_links.getUrlDomain(window.location.href);
                if (urlDomain !== currentDomain){
                    var frame = document.createElement('iframe');
                    frame.setAttribute("id", "frame-"+url);
                    frame.setAttribute("data-url", url);
                    frame.setAttribute("tabindex", -1);
                    frame.setAttribute('src', url + '?iframe=1');
                    frame.setAttribute('class', 'favorite-links-frames');
                    frame.style.display = "none";
                    var body = document.getElementsByTagName('body')[0];
                    body.appendChild(frame);
                }
            }
        },
        setReceive: function () {
            window.onmessage = function(e) {
                var writeToLocal = false;
                var originUrl = e.origin;
                var thisDomain = umlibrary_favorite_links.getUrlDomain(window.location.href);
                var originUrlDomain = umlibrary_favorite_links.getUrlDomain(originUrl);
                for (var i = 0; i < trusted_urls.length; i = i +1){
                    var trustedUrlDomain = umlibrary_favorite_links.getUrlDomain(trusted_urls[i]);
                    if (trustedUrlDomain === originUrlDomain && originUrlDomain !== thisDomain){
                        writeToLocal = true;
                        break;
                    }
                }
                if (writeToLocal) {
                    if (umlibrary_favorite_links.isJSONString(e.data)) {
                        localStorage.umLibraryFavorites = e.data;
                    }
                }
            };
        },
        getUrlDomain: function (url) {
            var l = document.createElement("a");
            l.href = url;
            return l.hostname;
        },
        propagateFavorites: function () {
            if (!isInIFrame) {
                $(".favorite-links-frames").each(function() {
                    var id = $(this).attr("id");
                    var url = $(this).attr("data-url");
                    var win = document.getElementById(id).contentWindow;
                    win.postMessage(localStorage.umLibraryFavorites, url);
                });
            }
        },
        isJSONString: function isJson(data) {
            try {
                JSON.parse(data);
            } catch (e) {
                return false;
            }
            return true;
        },
        getParamFromUrl: function(param) {
            param = param.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
            var regex = location.search.match(new RegExp("[?&]" + param + "=([^&]+)(&|$)"));
            return regex && decodeURIComponent(regex[1].replace(/\+/g, " "));
        }
    };

    return umlibrary_favorite_links;
}