
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'
import './mask'
import {h3ToGeoBoundary} from "h3-js";



const BOUNDS = new L.LatLngBounds(new L.LatLng(51.00684227163969, 11.854248046875), new L.LatLng(53.50765128545441, 14.578857421875));

function numberToColorRgb(i, cRed=true, cGreen=true, cBlue=true) {
    var red = 0, green = 0, blue = 0;
    if(cRed)
        red = Math.floor(255 - (255 * i / 100));
    if(cGreen)
        green = Math.floor(255 * i / 100);
    if(cBlue)
        blue = Math.floor(255 * i / 100);
    return 'rgba('+red+','+green+','+blue+', '+(100-i)+')'
};

export default class {
    constructor(elementId = 'ge-map'){
        this.elementId = elementId;
    }
    init(elementId = 'ge-map', basemap = true){
        this.map = new L.map(this.elementId, {
            minZoom: 7,
            maxZoom: 14,
            zoomControl: false,
            dragging: true,
            //scrollWheelZoom: false,
            doubleClickZoom: false,
            maxBounds: BOUNDS,
            //maxBoundsViscosity: 1.0,

        }).setView([52.459028, 13.015833], 7);

        if(basemap)
            this.addBasemap()
    }
    /*changeBounds(bounds = BOUNDS){
        //this.map.setMaxBounds(bounds);
        //this.map.fitBounds(bounds);
        this.map.flyToBounds(bounds);
    }*/
    setCenter(lat, lon){
        this.map.setView([lat, lon], 7);
    }
    addBasemap(){
        this.removeBasemap();
        this.baseMapLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OSM Mapnik <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
    }
    removeBasemap(){
        if(this.baseMapLayer)
            this.map.removeLayer(this.baseMapLayer)
    }
    addMask(coordinates){
        this.removeMask();
        //var coordinates = featureCollection.features[0].geometry.coordinates[0][0];
        var latLngs = [];
        for (let i=0; i<coordinates.length; i++) {
            latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]));
        }

        this.maskLayer = L.mask(latLngs).addTo(this.map);

        //const polygon2 = polygon([coordinates]);
        //const bounds = bbox(polygon2);
        //const center = centroid(polygon2);
        //this.setCenter(center.geometry.coordinates[1], center.geometry.coordinates[0]);
        //this.changeBounds(L.LatLngBounds(L.LatLng(bounds[1], bounds[0]), L.LatLng(bounds[3], bounds[2])));
    }
    removeMask(){
        if(this.maskLayer){
            this.map.removeLayer(this.maskLayer)
            this.maskLayer = null;
        }
            
    }
    addRevierMask(coordinates){
        this.removeRevierMask();

        var latLngs = [];

        for (let i=0; i<coordinates.length; i++) {
            latLngs.push(new L.LatLng(coordinates[i][1], coordinates[i][0]));
        }

        this.maskRevierLayer = L.mask(latLngs).addTo(this.map);
    }
    removeRevierMask(){
        if(this.maskRevierLayer){
            this.map.removeLayer(this.maskRevierLayer)
            this.maskRevierLayer = null;
        }
            
    }
    addPolygonsByH3(data, color = '#000000'){
        this.removePolygonsByH3();
        const features = [];
        for( var i in data){
            features.push({
                type:"Feature",
                geometry:{
                    type:"Polygon",
                    coordinates: [h3ToGeoBoundary(data[i], true)]
                },
                properties: {
                    avg: Math.random(),//data[i][1] || 0
                }
            });
        }
        this.dataLayer = L.geoJson(
            {
                type: "FeatureCollection",
                features: features
            },
            {
                style: function(feature){
                    return {
                        fillColor: color, //numberToColorRgb(100-feature.properties.avg, true, false, true),
                        weight: 1,
                        opacity: .8,
                        color: '#000000',
                        dashArray: '',
                        fillOpacity: feature.properties.avg
                    };
                }
            }
        ).bindTooltip(function (layer) {
            return '<h4>Terminalverbiss im oberen drittel</h4>' + Math.round(layer.feature.properties.avg*100) + ' %';
        }).addTo(this.map).setZIndex(100).bringToFront();
    }
    removePolygonsByH3(){
        if(!this.dataLayer) return false;
        this.map.removeLayer(this.dataLayer)
    }
    addParent(featureCollection, callback){
        const that = this;
        this.removeParent();
        this.parentLayer = L.geoJson(
            featureCollection,
            {
                style: function(feature){
                    return {
                        //fillColor: '#333333', //numberToColorRgb(100-feature.properties.avg, true, false, true),
                        weight: 2,
                        opacity: .6,
                        color: '#00613A',
                        dashArray: '',
                        fillOpacity: 0
                    };
                },
                onEachFeature:function(feature, layer){
                    layer.on({
                        click: e => {
                            //console.log(feature, e, layer.getBounds())
                            callback(feature.properties.obf, true);
                            //that.map.fitBounds(layer.getBounds());
                        }
                    });
                }
            }
        ).bindTooltip(function (layer) {
            return '<bold>' + layer.feature.properties.name + '</bold>';
        }).addTo(this.map).setZIndex(10);
        console.log('new');
        this.map.fitBounds(this.parentLayer.getBounds());
    }
    removeParent(){
        if(!this.parentLayer) return false;
        this.map.removeLayer(this.parentLayer)
        this.parentLayer = null;
    }
    /*addInterpolation(mask, resolution, propertie){ // geht nicht, weil nicht NUR WALD
        var bbox = turf.bbox(mask);
        console.log(bbox);
        var points = turf.randomPoint(30, {bbox: bbox});

        // add a random property to each point
        turf.featureEach(points, function(point) {
            point.properties[propertie] = Math.round(Math.random() * 100);
        });
        var options = {gridType: 'hex', property: propertie, units: 'kilometers'};
        var grid = turf.interpolate(points, resolution, options);

        const that = this;
        this.removeInterpolation();

        //var ptsWithin = turf.pointsWithinPolygon(grid, mask);

        this.interpolationLayer = L.geoJson(
            grid,
            {
                style: function(feature){
                    return {
                        fillColor: numberToColorRgb(100-feature.properties[propertie], true, false, true),
                        weight: 1,
                        opacity: .8,
                        color: '#000000',
                        dashArray: '',
                        fillOpacity: feature.properties[propertie]/100
                    };
                }
            }
        ).bindTooltip(function (layer) {
            return '<bold>' + Math.round(layer.feature.properties[propertie]) + ' % </bold>';
        }).addTo(this.map).setZIndex(100).bringToFront();

        this.map.fitBounds(this.interpolationLayer.getBounds());
    }
    removeInterpolation(){
        if(!this.interpolationLayer) return false;
        this.map.removeLayer(this.interpolationLayer)
        this.interpolationLayer = null;
    }*/
    addObf(featureCollection, callback){ // REVIERE
        const that = this;
        this.curRevier = null;
        this.removeParent();
        this.removeObf();
        this.obfLayer = L.geoJson(
            featureCollection,
            {
                style: function(feature){
                    return {
                        //fillColor: '#333333', //numberToColorRgb(100-feature.properties.avg, true, false, true),
                        weight: 1,
                        opacity: .6,
                        color: '#000000',
                        dashArray: '',
                        fillOpacity: 0
                    };
                },
                onEachFeature:function(feature, layer){
                    layer.on({
                        click: e => {
                            callback(feature.properties.fid, false);
                            console.log('click');
                            that.curRevier = feature.properties.fid;
                            that.map.fitBounds(layer.getBounds());
                        }
                    });
                }
            }
        ).bindTooltip(function (layer) {
            if(that.curRevier === layer.feature.properties.fid) return false;
            return '<bold>' + layer.feature.properties.name + '</bold>';
        }).addTo(this.map).setZIndex(20);

        this.map.fitBounds(this.obfLayer.getBounds());
    }
    removeObf(){
        if(!this.obfLayer) return false;
        this.map.removeLayer(this.obfLayer)
        this.obfLayer = null;
    }
}