import L from 'leaflet';
import './mask'
//import {h3ToGeoBoundary} from "h3-js";
//import * as featureCollection from '../../../data/verbiss_ausw_fl_ba_2020_7_geo.json';

//const featureCollection = require('../../../data/bb_7_geo.json')
//const outlines = require('../../../data/land_small')

//import featureCollection from './test.json';
//import {featureCollection} from './bb_7_geo.json';
//import {outlines} from '../../data/land_small.json'; // FEHLER


function getColor(d) {
    return d > 1000 ? '#800026' :
           d > 500  ? '#BD0026' :
           d > 200  ? '#E31A1C' :
           d > 100  ? '#FC4E2A' :
           d > 50   ? '#FD8D3C' :
           d > 20   ? '#FEB24C' :
           d > 10   ? '#FED976' :
                      '#FFEDA0';
}
function numberToColorRgb(i) {
    // we calculate red and green
    var red = Math.floor(255 - (255 * i / 100));
    var green = Math.floor(255 * i / 100);
    // we format to css value and return
    return 'rgb('+red+','+green+',0)'
}
function style(feature) {
    return {
        fillColor: numberToColorRgb(100-feature.properties.avg),
        weight: 1,
        opacity: .8,
        color: '#016139',
        dashArray: '',
        fillOpacity: 0.7
    };
}

let polygons;


const bounds = new L.LatLngBounds(new L.LatLng(51.00684227163969, 11.854248046875), new L.LatLng(53.50765128545441, 14.578857421875));

var map = L.map('ge-map', {
    minZoom: 7,
    maxZoom: 12,
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
}).setView([52.459028, 13.015833], 7);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);





// Interaction
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: '#e73027',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}
function resetHighlight(e) {
    polygons.resetStyle(e.target);
}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

// Legend
/*var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100],
        labels = [];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);*/

var coordinates = outlines.features[0].geometry.coordinates[0][0];
var latLngs = [];
for (let i=0; i<coordinates.length; i++) {
    latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]));
}

L.mask(latLngs).addTo(map);

// Brandenburg
var layerpoly = new L.geoJSON(outlines.features, {
    style: function(feature){
        return {
            color: "black",
            weight: 1,
            opacity: .4,
            fillColor: "white",
            fillOpacity: 0.5
        };
    }
}).addTo(map);

// Berlin
L.geoJson(
    {
        type: "FeatureCollection",
        features: [
            {
                type:"Feature",
                geometry:{
                    type:"Polygon",
                    coordinates: [outlines.features[0].geometry.coordinates[0][1]],
                }
            }
        ]
    },
    {
        style: function(feature){
            return {
                color: "black",
                weight: 1,
                opacity: .4,
                fillColor: "white",
                fillOpacity: 1
            };
        }
    }
).addTo(map);

// h3 GRid
polygons = new L.geoJSON(
    featureCollection,
    {
        style: style,
        onEachFeature: onEachFeature
    }
).bindTooltip(function (layer) {
    return '<h4>Terminalverbiss im oberen drittel</h4>' + layer.feature.properties.avg + ' %';
 }
).addTo(map);