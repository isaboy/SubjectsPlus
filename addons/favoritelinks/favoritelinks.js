/**
 * Created by acarrasco on 12/16/2016.
 */

function favoriteDatabasesList() {

    var sitesConfig = {
        spConfig: {
            "origin": "http://sp4.local",
            "sendTo": "http://10.179.1.174/",
            "favoriteButtonAccountMenuDivClass": "mega_child mega-sm mega-right-special2",
            "favoriteButtonDatabaseListDivClass": "favorite_button",
            "favoriteButtonIconClass": "favorite-database-icon",
            "favoriteButtonPageHeaderDivClass": ""
        },
        wpConfig: {
            "origin": "http://10.179.1.174",
            "sendTo": "http://sp4.local",
            "headerClass": "page-header",
            "favoriteButtonAccountMenuDivClass":"login mega tour_6"
        }
    };
    var minimumItemsCountForSearchBar = 5;
    var defaultLinks =
    [
        {
            "linkName": "Research Guides",
            "urlLink": "http://sp.library.miami.edu/subjects/index.php",
            "tag": "Page"
        },
        {
            "linkName": "University of Miami Libraries",
            "urlLink": "http://library.miami.edu/",
            "tag": "Page"
        }
    ];
    var thisSite;
    var thisSiteConfig;

    var previouslyLoggedIn = false;
    var umlibrary_favorite_links = {
        init: function () {
                if (!umlibrary_favorite_links.isInIFrame()){
                    umlibrary_favorite_links.detectSite();
                    umlibrary_favorite_links.prepareUI();

                    window.onbeforeunload = function(event) {
                        umlibrary_favorite_links.logOutFromGoogle(false);
                    };
                    umlibrary_favorite_links.setCommunications();
                    umlibrary_favorite_links.bindUIActions();
                    umlibrary_favorite_links.createDefaultListOfLinks();
                    umlibrary_favorite_links.detectLocalStorageChange();
                }
        },
        isInIFrame: function () {
            try {
                return window.self !== window.top;
            } catch (e) {
                return true;
            }
        },
        detectSite: function () {
            if (window.location.origin === sitesConfig.spConfig.origin) {
                thisSite = "spConfig";
                thisSiteConfig = sitesConfig.spConfig;
                umlibrary_favorite_links.includeVendorsJSAndCSS();
          }else if (window.location.origin===sitesConfig.wpConfig.origin) {
              thisSite = "wpConfig";
              thisSiteConfig = sitesConfig.wpConfig;
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
            umlibrary_favorite_links.showFavoriteAndMenuButtons();
            umlibrary_favorite_links.addFavoriteLinksButtonToAccountsMenu();

            if (thisSite==='wpConfig') {
                umlibrary_favorite_links.addFavoriteButtonToHeader();
            }
            umlibrary_favorite_links.createFavoriteLinksModal();
            umlibrary_favorite_links.setFavorites();
            umlibrary_favorite_links.addLinkToFavorites();
            umlibrary_favorite_links.exportFavoritesList();
            umlibrary_favorite_links.importFavorites();
            umlibrary_favorite_links.favoritesListInput();
        },
        showFavoriteAndMenuButtons: function () {
            if (thisSite==='spConfig') {
                var databasesDiv = document.getElementsByClassName(thisSiteConfig['favoriteButtonDatabaseListDivClass']);
                for (var i = 0; i < databasesDiv.length; i++) {
                    databasesDiv[i].style.visibility = 'visible';
                }
            }
        },
        addFavoriteLinksButtonToAccountsMenu: function () {
            var accountsMenu = document.getElementsByClassName(thisSiteConfig['favoriteButtonAccountMenuDivClass'])[0];
            var accountsMenuUl = accountsMenu.getElementsByTagName("ul")[0];

            var divOptions = document.createElement('div');
            divOptions.className = "mega_more favorite_links_options";

            var favoriteListInput = document.createElement('input');
            favoriteListInput.setAttribute('id', 'favoritesListInput');
            favoriteListInput.setAttribute('type', 'file');

            var li = document.createElement('li');

            var myFavoriteLibraryLinks = document.createElement('a');
            myFavoriteLibraryLinks.setAttribute('id', 'umlibrary_favorite_links_button');
            myFavoriteLibraryLinks.text = 'Quick Links';
            li.appendChild(myFavoriteLibraryLinks);

            accountsMenuUl.appendChild(favoriteListInput);
            accountsMenuUl.appendChild(li);
        },
        addFavoriteButtonToHeader: function () {
            var header = $(".page-header");
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

            umlibrary_favorite_links.createLeftSideOfModal(modalContent);
            umlibrary_favorite_links.createRightSideOfModal(modalContent);
            umlibrary_favorite_links.createListFromGoogleDriveModal(modal);
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
        },
        createSearchBar: function (container) {
            var searchBar = document.createElement('input');
            searchBar.type = "text";
            searchBar.id = "favoriteLinksSearchBar";
            searchBar.placeholder = "Search for quick links";

            searchBar.onkeydown = function(event){
                if(event.shiftKey && event.keyCode == 9) {
                    var divFilesFromGoogleDrive =  document.querySelector('#favorite-links-files-from-google-drive');
                    if (umlibrary_favorite_links.divIsVisible(divFilesFromGoogleDrive)){
                        alert('Google Files');
                        return;
                    }else {
                        document.querySelector('#favorite-links-modal-close-button').focus();
                    }
                }
            };

            searchBar.style.display = 'none';

            var searchBarDiv = document.createElement('div');
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
        createListFromGoogleDriveModal: function(modal){
            var filesFromDriveList = document.createElement('div');
            filesFromDriveList.setAttribute("id", "favorite-links-files-from-google-drive");
            modal.appendChild(filesFromDriveList);

            var filesFromDriveListContent = document.createElement('div');
            filesFromDriveListContent.setAttribute("id", "favorite-links-files-from-google-drive-content");
            var closeButton = umlibrary_favorite_links.generateModalCloseButton(filesFromDriveList, "");

            $(closeButton).on('click', function () {
                umlibrary_favorite_links.logOutFromGoogle(false);
            });

            filesFromDriveListContent.appendChild(closeButton);
            var text = document.createElement('h3');
            text.appendChild(document.createTextNode("Select the saved links file"));
            filesFromDriveListContent.appendChild(text);
            filesFromDriveList.appendChild(filesFromDriveListContent);
        },
        favoriteLinksModalHeader: function (container) {
            var favoriteListInput = document.createElement('input');
            favoriteListInput.setAttribute('id', 'favoritesListInput');
            favoriteListInput.setAttribute('type', 'file');

            var divOptionsMenu = document.createElement('nav');
            divOptionsMenu.id = 'favorite-links-options-menu';

            var ul = document.createElement('ul');
            ul.className = 'nav-menu';

            umlibrary_favorite_links.createSaveLinksDropDownMenu(ul);
            umlibrary_favorite_links.createLoadLinksDropDownMenu(ul);

            divOptionsMenu.appendChild(ul);

            container.appendChild(divOptionsMenu);
            container.appendChild(umlibrary_favorite_links.generateModalCloseButton($(container).parent().parent(), "favorite-links-modal-close-button"));
            container.appendChild(favoriteListInput);
        },
        createSaveLinksDropDownMenu: function (ul) {
            var saveLinksNavItem = document.createElement('li');
            saveLinksNavItem.className = 'nav-item';

            var saveLinksAnchor = document.createElement('a');
            saveLinksAnchor.href='';
            saveLinksAnchor.appendChild(document.createTextNode('Save Links'));

            var divSubNav = document.createElement('div');
            divSubNav.className = "sub-nav";

            var ulSubNavGroup = document.createElement('ul');
            ulSubNavGroup.className = "sub-nav-group";

            var liSaveLocal = document.createElement("li");

            var saveFavorites = document.createElement('a');
            saveFavorites.href='';
            saveFavorites.setAttribute('id', 'umlibrary_favorite_links_save_favorites_button');
            saveFavorites.className = 'umlibrarysurvey-favorites-actions';
            saveFavorites.text = 'Save to local drive';

            var saveToLocalIcon = document.createElement('i');
            saveToLocalIcon.className = "fa fa-hdd-o fa-3";

            liSaveLocal.appendChild(saveToLocalIcon);
            liSaveLocal.appendChild(saveFavorites);

            var liSaveToDrive = document.createElement("li");

            var saveFavoritesToDrive = document.createElement('a');
            saveFavoritesToDrive.href='';
            saveFavoritesToDrive.setAttribute('id', 'umlibrary_favorite_links_save_to_drive_button');
            saveFavoritesToDrive.className = 'umlibrarysurvey-favorites-actions';
            saveFavoritesToDrive.text = 'Save to Google Drive';

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
            loadLinksNavItem.className = 'nav-item';

            var loadLinksAnchor = document.createElement('a');
            loadLinksAnchor.href='';
            loadLinksAnchor.appendChild(document.createTextNode('Load Links'));

            var divSubNav = document.createElement('div');
            divSubNav.className = "sub-nav";

            var ulSubNavGroup = document.createElement('ul');
            ulSubNavGroup.className = "sub-nav-group";

            var liLoadLocal = document.createElement("li");

            var loadFavorites = document.createElement('a');
            loadFavorites.href='';
            loadFavorites.setAttribute('id', 'umlibrary_favorite_links_load_favorites_button');
            loadFavorites.className = 'umlibrarysurvey-favorites-actions';
            loadFavorites.text = 'Load from local drive';

            var loadFromLocalIcon = document.createElement('i');
            loadFromLocalIcon.className = "fa fa-hdd-o fa-3";

            liLoadLocal.appendChild(loadFromLocalIcon);
            liLoadLocal.appendChild(loadFavorites);

            var liLoadFromDrive = document.createElement("li");

            var loadFavoritesFromDrive = document.createElement('a');
            loadFavoritesFromDrive.href='';
            loadFavoritesFromDrive.setAttribute('id', 'umlibrary_favorite_links_load_from_drive_button');
            loadFavoritesFromDrive.className = 'umlibrarysurvey-favorites-actions';
            loadFavoritesFromDrive.text = 'Load from Google Drive';

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

            $('.umlibrarysurvey-favorites-actions').click(function(event){
                event.preventDefault();
            });
        },
        filterTagBehavior: function () {
            $(".umlibrary-favorite-links-filter-tag-checkbox").click(function () {
                $('.umlibrary-favorite-links-filter-tag-checkbox').not(this).prop('checked', false);
                var filterTag = $(".umlibrary-favorite-links-filter-tag-checkbox:checkbox:checked").parent().text();

                if (filterTag) {
                    $('ul#favoriteLinksModalWindowList li:not(li[filtertag=' + filterTag + '])').hide();
                    $('ul#favoriteLinksModalWindowList li[filtertag=' + filterTag + ']').show();
                }else{
                    $('ul#favoriteLinksModalWindowList li[filtertag]').show();
                }
            })
        },
        createDefaultListOfLinks: function () {
            if ($.isEmptyObject(localStorage.umLibraryFavorites)) {
                localStorage.umLibraryFavorites = "[]";
                var defaultLinks =  config.defaultLinks;
                for (var key in defaultLinks) {
                    var link = defaultLinks[key];
                    umlibrary_favorite_links.saveFavoritesToLocalStorage(link.linkName, link.urlLink, link.tag);
                }
                umlibrary_favorite_links.propagateFavorites();
            }
        },
        setFavorites: function () {
            if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                var len = favorites.length;

                $(".umlibrary-favorite-button").each(function () {
                    var linkName = document.getElementsByTagName("title")[0].innerHTML;
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
                    var anchor = $(this).parent().parent().find("a")[0];
                    var linkName = $(anchor).text();
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
                        var anchor = $(this).parent().parent().find("a")[0];

                        linkName = $(anchor).text();
                        urlLink = $(anchor).attr('href');
                        if (!deleting) {
                            umlibrary_favorite_links.saveFavoritesToLocalStorage(linkName, urlLink, 'Database');
                        }
                    }else{
                        linkName = document.getElementsByTagName("title")[0].innerHTML;
                        urlLink = document.URL;
                        if (!deleting) {
                            umlibrary_favorite_links.saveFavoritesToLocalStorage(linkName, urlLink, 'Page');
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
        saveFavoritesToLocalStorage: function (linkName, urlLink, tag) {
            if (linkName.includes("|")){
                linkName = linkName.split("|")[0];
            }

            var favorites = JSON.parse(localStorage.umLibraryFavorites);
            favorites.push({"linkName": linkName, "urlLink": urlLink, "tag": tag});
            localStorage.umLibraryFavorites = JSON.stringify(favorites);
            umlibrary_favorite_links.propagateFavorites();
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
            $("#umlibrary_favorite_links_save_favorites_button").click(function () {
                    if (typeof(Storage) !== "undefined") {
                        if (!$.isEmptyObject(localStorage.umLibraryFavorites)) {
                            if (umlibrary_favorite_links.getInternetExplorerVersion() != 0) {
                                umlibrary_favorite_links.saveOnInternetExplorer();
                            } else {
                                umlibrary_favorite_links.saveOnDisk();
                            }
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
            $("#umlibrary_favorite_links_load_favorites_button").click(function () {
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
                    if (objectLength != 2) {
                        throw 'error';
                    } else if (!('linkName' in favorites[i]) && !('urlLink' in favorites[i])) {
                        throw 'error';
                    }
                }
                localStorage.umLibraryFavorites = JSON.stringify(favorites);
                umlibrary_favorite_links.logOutFromGoogle(true);
            } catch (e) {
                alert('The favorites list file is either corrupted or wrong!');
            }

        },
        myFavoriteLinksButtonBehavior: function () {
            $("#umlibrary_favorite_links_button").click(function (event) {
                umlibrary_favorite_links.fillLinksList();
                var modal = document.getElementById("favorite-links-modal-window");
                modal.style.display = "block";

                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                if (favorites.length > minimumItemsCountForSearchBar) {
                    document.querySelector('#favoriteLinksSearchBar').style.display= 'block';
                    document.querySelector('#favoriteLinksSearchBar').focus();
                }else{
                    document.querySelector('#favorite-links-modal-window').focus();
                }

                console.log(document.activeElement);
            });
        },
        loadFromGoogleDriveButtonBehavior: function () {
            $("#umlibrary_favorite_links_load_from_drive_button").click(function (event) {
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
            var driveFilesList = document.getElementById('favorite-links-files-from-google-drive');
            var driveFilesListContent = document.getElementById('favorite-links-files-from-google-drive-content');
            $("#favorite-links-files-from-google-drive-content ul").remove();
            var ul = document.createElement('ul');
            driveFilesListContent.appendChild(ul);
            var request = gapi.client.drive.files.list({
                'q': "appProperties has { key='umlibraryfile' and value='umlibrary-favorite-links-file' }",
                'fields': "nextPageToken, files(id, name)"
            });
            request.execute(function (resp) {
                var files = resp.files;
                if (files && files.length > 0) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        var li = document.createElement('li');
                        li.className = 'umlibrary-favorite-links-saved-file-item';
                        li.setAttribute('googleDriveFileId', file.id);
                        li.appendChild(document.createTextNode(file.name));

                        $(li).click(function (event) {
                            umlibrary_favorite_links.getFileInformationFromGoogleDrive($(this).attr('googleDriveFileId'));
                        });

                        ul.appendChild(li);
                    }
                } else {
                    ul.appendChild(document.createTextNode('No favorite files found!'));
                }
            });

            driveFilesList.style.display = "block";
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
            var header = document.createElement('h2');
            header.appendChild(document.createTextNode("What are these \"Quick Links\"?"));

            var description = document.createElement('p');
            description.appendChild(document.createTextNode("Quick Links are a way of storing your most frequented pages or databases without logging in. They are tied to your computer and " +
                "your web browser, so they will disappear if you clear your cache or use another computer. But you can always save and export them using the buttons above ^^."));

            var instructions = document.createElement('p');
            instructions.appendChild(document.createTextNode("* Add a link by clicking on the link icon when you see it." + "* Find your links under Quick Links in the Accounts+ Menu."));

            rightDiv.appendChild(header);
            rightDiv.appendChild(description);
            rightDiv.appendChild(instructions);

        },
        generateModalCloseButton: function (parentToClose, id) {
            var close = document.createElement('button');
            if (id){
                close.setAttribute("id", id);
            }
            close.className = "favorite-links-modal-window-close-button";

            $(close).click(function (event) {
                $(parentToClose).hide();
            });
            close.appendChild(document.createTextNode("x"));
            // close.onkeydown = function(event){
            //     if(event.keyCode == 9) {
            //         var divFilesFromGoogleDrive =  document.querySelector('#favorite-links-files-from-google-drive');
            //         if (umlibrary_favorite_links.divIsVisible(divFilesFromGoogleDrive)){
            //             alert('Google Files');
            //             return;
            //         }else {
            //             document.querySelector('#favoriteLinksSearchBar').focus();
            //         }
            //     }
            // };
            return close;
        },
        fillLinksList: function () {
            var modalContent = document.getElementById("favorite-links-modal-window-content-list");
            if (localStorage.umLibraryFavorites) {
                var favorites = JSON.parse(localStorage.umLibraryFavorites);
                if (favorites.length > 0) {
                    var fieldset = document.createElement('fieldset');
                    fieldset.className = "umlibrary-favorite-links-filterby-fieldset";
                    var legend = document.createElement('legend').appendChild(document.createTextNode('Filter by:'));
                    fieldset.appendChild(legend);

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

                        var remove = document.createElement('i');
                        remove.className = "fa fa-minus-circle umlibrary-delete-favorite-button";
                        $(remove).hide();

                        $(remove).click(function (event) {
                            umlibrary_favorite_links.removeFavoriteFromList($(this).parent());
                            umlibrary_favorite_links.setFavorites();
                        });

                        var favIcon = document.createElement('img');
                        var scrubbedURL = urlLink;
                        if (scrubbedURL.includes("http://access.library.miami.edu/login?url=")){
                            var scrubbedURL =scrubbedURL.split("http://access.library.miami.edu/login?url=", 2)[1];
                        }

                        if (scrubbedURL.includes("?")){
                            var scrubbedURL =scrubbedURL.split("?", 2)[0];
                        }
                        favIcon.src = "https://www.google.com/s2/favicons?domain_url=" + scrubbedURL;

                        var li = document.createElement('li');
                        $(li).hover(
                            function() {
                                $(this).toggleClass('active');
                                $( this ).find("i").show();
                                $( this ).find("button").show();
                            }, function() {
                                $(this).toggleClass('active');
                                $( this ).find("i").hide();
                                $( this ).find("button").hide();
                            }
                        );
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
            if (!umlibrary_favorite_links.isInIFrame()) {
                umlibrary_favorite_links.setSendFrame();
            }else{
                umlibrary_favorite_links.setReceive();
            }
        },
        setSendFrame: function () {
            var frame = document.createElement('iframe');
            frame.setAttribute("tabindex", -1);
            frame.setAttribute('src', thisSiteConfig.sendTo);
            frame.setAttribute('id', 'sendMessagesFrame');
            frame.style.display = "none";
            var body = document.getElementsByTagName('body')[0];
            body.appendChild(frame);
        },
        setReceive: function () {
            window.onmessage = function(e) {
                if (e.origin !== thisSiteConfig.sendTo) {
                    return;
                }
                localStorage.umLibraryFavorites = e.data;
            };

        },
        propagateFavorites: function () {
            var win = document.getElementById('sendMessagesFrame').contentWindow;
            win.postMessage(localStorage.umLibraryFavorites, "*");
        }
    };

    return umlibrary_favorite_links;
}