'use strict';

//included theme
var NewsMap = angular.module('NewsMap', ['ngResource']);

NewsMap.controller('MainController', ['$scope', '$resource',
    function($scope, $resource) {
    var map = L.map('map').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 3,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmFndWlhcjIiLCJhIjoiY2o2cXlqMGkxMDNnNTJ3cGgycDVkbGZ0NyJ9.SqYXt15ZDa3B5ZIAqsqlJA'
    }).addTo(map);

    var popup = L.popup();

    var mapStyle = {
        "weight": 2,
        "opacity": 0.33,
        "fillOpacity": 0
    };

    var worldGeoJSON = new L.GeoJSON.AJAX('geo-countries-master/data/worldmap.geojson',{
        style:mapStyle,
        onEachFeature: onEachFeature
    });

    worldGeoJSON.addTo(map);

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

    function resetHighlight(e) {
        worldGeoJSON.resetStyle(e.target);
        info.update();
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

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        this._div.innerHTML = '<h4>World Map</h4>' +  (props ?
            '<b>' + props.ADMIN
            : 'Select a country');
    };
    info.addTo(map);

}]);


