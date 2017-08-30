'use strict';

//included theme
var NewsMap = angular.module('NewsMap', ['ngResource']);

NewsMap.controller('MainController', ['$scope', '$resource', '$http', '$httpParamSerializer',
    function mainControllerSetup($scope, $resource,$http,$httpParamSerializer) {
    var map = L.map('map');
    map.setView([51.505, -0.09], 3);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; ' +
        '<a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
        ' <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 3,
        id: 'mapbox.run-bike-hike',
        accessToken: 'pk.eyJ1IjoicmFndWlhcjIiLCJhIjoiY2o2cXlqMGkxMDNnNTJ3cGgycDVkbGZ0NyJ9.SqYXt15ZDa3B5ZIAqsqlJA'
    }).addTo(map);

    var popup = L.popup();
    var country_stories_dict = {};

    var mapStyle = {
        "weight": 2,
        "opacity": 0.33,
        "fillOpacity": 0
    };
        document.onreadystatechange = function () {
            var state = document.readyState;
            if (state === 'complete') {
                document.getElementById('interactive');
                document.getElementById('load').style.visibility="hidden";
            }
        };



    function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 5,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
        }
        info.update(layer.feature.properties);
    }

   	function generatePopupString(stories){
   		var popupcontent = '';
   		for (var i = 0; i <3; i ++) {
            var story = stories[i];
            var storyurl = story.url;
            var storyname = story.name;
            var imgurl = "";
            // Handle error case with no image.
            if (story.image !== undefined
                && story.image.thumbnail !== undefined
                && story.image.thumbnail.contentUrl !== undefined){
                imgurl =story.image.thumbnail.contentUrl;
            }
            popupcontent += "<h3><img alt = \"no image could be displayed\" height='75px' " +
                "width='75px' src = \"" + imgurl + "\"/>";
            popupcontent += "<a href = " + storyurl + " target = \"_blank\">" + storyname + "</a></h3>";
        }
        return popupcontent
   	}

    function getNews(e){
        var countryname = e.target.feature.properties.ADMIN;
        var params = {
            // Bing news search request parameters
            "q": countryname,
            "count": "3",
            "offset": "0",
            "mkt": "en-us",
            "safesearch": "Moderate"
        };
        popup
            .setLatLng(e.latlng)
            .setContent("Getting news for " + countryname)
            .openOn(map);

        if (countryname in country_stories_dict) {
        	    popup
                    .setLatLng(e.latlng)
                    .setContent(country_stories_dict[countryname])
                    .openOn(map);
                    return
        }

        // User clicked on a new country
        // $http({
        //     method: 'GET',
        //     url: "https://api.cognitive.microsoft.com/bing/v7.0/search?"+ $httpParamSerializer(params),
        //     headers:{"Ocp-Apim-Subscription-Key":"ff6537d7c53143ddaca11288a7e7b978"}
        // }).then(
        //     function successCallback(response) {
        //     	if (response.data === undefined || response.data.news === undefined || response.data.news.value === undefined){
        //     		popup
        //             .setLatLng(e.latlng)
        //             .setContent("Could not get news for " + countryname +". Try again later.")
        //             .openOn(map);
        //             return
        //     	}
        //         var stories = response.data.news.value;
        //         var popupcontent = generatePopupString(stories)
        //         country_stories_dict[countryname] = popupcontent;
        //         popup
        //             .setLatLng(e.latlng)
        //             .setContent(popupcontent)
        //             .openOn(map);

        //     }, function errorCallback(response) {
        //         popup
        //             .setLatLng(e.latlng)
        //             .setContent("Could not get news for " + countryname +". Try again later.")
        //             .openOn(map);
        //     });

        //Test URL's:
        //img thumbnail: "https://www.bing.com/th?id=ON.6A50B14DB78999FC57C4BC127E1E541F&pid=News"
        //at depth: story.image.thumbnail.contentUrl
        // link: "https://www.usnews.com/education/best-global-universities/united-kingdom"
        // at depth: story.url
        // name: "Best Global Universities in the United Kingdom"
        // at depth: story.name

        //Dummy HTTP call so the API call count dosen't decrease.
        $http({
            method: 'GET',
            url: 'http://www.google.com?' + $httpParamSerializer(params),
        }).then(
            function successCallback(response) {
                var popupcontent = '';
                //var stories = response.data.news.value;
                //Test URL's:
                var storyurl = "https://www.usnews.com/education/best-global-universities/united-kingdom";
                var storyname = "Best Global Universities in the United Kingdom";
                var imgurl  = "https://www.bing.com/th?id=ON.6A50B14DB78999FC57C4BC127E1E541F&pid=News";
                for (var i = 0; i <3; ++i) {
                    popupcontent += "<h3><img height='75px' width='75px' src = \"" + imgurl + "\"/>";
                    popupcontent += "<a href = " + storyurl + " target = \"_blank\">" + storyname + "</a></h3>";
                }
                popup
                    .setLatLng(e.latlng)
                    .setContent(popupcontent)
                    .openOn(map);        
        }, function errorCallback(response) {
        	popup
                    .setLatLng(e.latlng)
                    .setContent("Could not get news for " + countryname +". Try again later.")
                    .openOn(map);
        });
    }

    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: getNews
        });
    }

    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that used to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>World Map</h4>' +  (props ?
            '<b>' + props.ADMIN
            : 'Select a country');
    };
    info.addTo(map);

        // TODO: this is expensive. add a timeout?
        var  worldGeoJSON = new L.GeoJSON.AJAX('geo-countries-master/data/worldmap.geojson', {
            style: mapStyle,
            onEachFeature: onEachFeature
        });
        worldGeoJSON.addTo(map);

        function resetHighlight(e) {
            worldGeoJSON.resetStyle(e.target);
            info.update();
        }

    }]);


