import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';
import {TileLayer, H3HexagonLayer} from '@deck.gl/geo-layers';

/* global window */
const devicePixelRatio = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
let curState = {
    currentObf: null
};

export default class {
    constructor(elementId = 'ge-map'){
        this.elementId = elementId;
        this.INITIAL_VIEW_STATE = {
            latitude: 52.459028, 
            longitude: 13.015833,
            zoom: 7,
            minZoom: 6,
            maxZoom: 14
        };
        this.layers = []
        this.h3Data = []
        this.obfData = {}
        this.fid = null;
    }
    init(){
        this.deckgl = new Deck({
            canvas: 'ge-canvas',
            container: this.elementId,
            initialViewState: this.INITIAL_VIEW_STATE,
            controller: true,
            layers: this.layers,
            onViewStateChange: ({viewState}) => {
                //console.log( viewState );
            },
            getTooltip: ({object}) => object && this.showToolTip(object)
        });
        this.createBaseMap();
        this.createPolygonsByH3();
    }
    showToolTip(object){
        var value = Math.round(object.val).toString();
        return {
            html: `<span>-</span><div>${value} %</div>`,
            style: {
              backgroundColor: '#fff',
              fontSize: '1em'
            }
        };
    }
    createBaseMap(){
        this.baseMap = new TileLayer({
            // https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Tile_servers
            data: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
            ],
            maxRequests: 20,
            pickable: false,
            // https://wiki.openstreetmap.org/wiki/Zoom_levels
            /*minZoom: 6,
            maxZoom: 14,*/
            tileSize: 256,
            zoomOffset: devicePixelRatio === 1 ? -1 : 0,
            renderSubLayers: props => {
                const {
                    bbox: {west, south, east, north}
                } = props.tile;
        
                return [
                    new BitmapLayer(props, {
                    data: null,
                    image: props.data,
                    bounds: [west, south, east, north]
                    })
                ];
            }
        })
        this.layers.push(this.baseMap);
        //this.deckgl.setProps({ layers: [...[this.baseMap]] });
    }
    createMaskLayer(feature){
        console.log(this.maskLayer);
        if(this.maskLayer){
            this.maskLayer = new GeoJsonLayer({
                id: 'mask-layer',
                data: feature,
                getFillColor: [160, 160, 180, 200],
                stroked: false,
                extruded: false,
                wireframe: true,
                lineJointRounded: true,
            });
            return;
        }else{
            this.maskLayer = new GeoJsonLayer({
                id: 'mask-layer',
                data: this.polyMask(feature),
                getFillColor: [255,255,255,255],
                stroked: false,
                extruded: false,
                wireframe: true,
                lineJointRounded: true,
            });
            this.layers.push(this.maskLayer);
            
            //this.deckgl.setProps({ layers: [...[this.maskLayer]] });
            this.fitBounds(feature);
        }
    }
    polyMask = (isochrone) => {
        const bboxPoly = turf.bboxPolygon([-180, -85, 180, 85]);
        const mask = turf.difference(bboxPoly, isochrone);
        return mask;
    }
    fitBounds(feature){
        var bbox = turf.bbox(feature);
        const viewport = new WebMercatorViewport(this.deckgl.viewState);
        let {longitude, latitude, zoom} = viewport.fitBounds([
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]]
        ]);
        
        // Zoom to the object
        //zoom = 14;
        this.deckgl.setProps({
            initialViewState: {longitude, latitude, zoom, minZoom: 6, maxZoom: 14}
        });
        
    }
    addLayer(){
        
    }
    /*addParent(feature){
        for (let member in this.obfData) delete this.obfData[member];
        for (let member in feature) this.obfData[member] = feature[member];
        console.log(this.obfData);
    }*/
    initFeatureSelected(features) {
        for (let i = 0; i < features.features.length; i++) {
          features.features[i].properties.hover = false;
      
          // Track each feature individually with a unique ID.
          //features.features[i].properties.id = i;
        }
      
        return features;
    }
    hoverFeature(properties){
        
        this.hoverObf = properties;
        for (let member in this.obfData.features){
            if(this.obfData.features[member].properties.fid === properties.fid){
                this.obfData.features[member].properties.hover = true;
            }else{
                this.obfData.features[member].properties.hover = false;
            }
        };
        if(curState.currentObf !== properties.fid){
            curState.currentObf = properties.fid
            //this.updateParent(this.obfData);
        }
    }
    addParent(feature, callback){
        this.obfData = this.initFeatureSelected(feature);
        this.updateParent(this.obfData, callback);
    }
    updateParent(feature, callback){
        console.log('UPDATE:', curState.currentObf);
        //https://stackoverflow.com/questions/57844718/deck-gl-geojsonlayer-update-feature-color-on-click
        this.obfLayer = new GeoJsonLayer({
            id: 'obf-layer',
            data: this.obfData,
            pickable: false,
            stroked: true,
            filled: true,
            extruded: false,
            wireframe: true,
            lineWidthMinPixels: 2 + Math.random(),
            getLineColor: [255,255,255,255],
            getFillColor: d => {
                console.log('triggered:', d.properties.hover);
                return d.properties.hover ? [255,255,255,0] : [255,255,255,10]
            },
            updateTriggers: {
                getFillColor: curState.currentObf
            },
            getLineWidth: 2,
            onHover: (info, event) => {
                if(info.picked){
                    this.hoverFeature(info.object.properties)
                    console.log();
                    //info.object.properties.hover = 1;
                }else{
                    this.hoverObf = null;
                }
            },
            onClick:  (info, event) => {
                if(info.picked){
                    console.log(info.object.properties);
                    let selection = parseInt(info.object.properties.obf);
                    callback(selection);
                }
            },
        });
        let layerIndex = this.layers.findIndex((element) => element.id === 'obf-layer')
        if(layerIndex == -1){
            this.layers.push(this.obfLayer);
        }else{
            this.layers.splice(layerIndex, 1);
            this.layers.push(this.obfLayer);
        }
        this.deckgl.setProps({layers: this.layers})

    }
    addPolygonsByH3(data){
        //this.h3Data.push(...data);
        this.createPolygonsByH3(data);
        //console.log('Data:', this.h3Data.length, this.layers);
    }
    createPolygonsByH3(data){
        this.h3Layer = new H3HexagonLayer({
            id: 'h3-hexagon-layer' + Math.random(),
            data: data,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            elevationScale: 50,
            coverage: 0.9,
            visible: true,
            getHexagon: d => d.hex,
            getFillColor: d => [( d.val / 100) * 255, (1 - d.val / 100) * 255, 0],
            getElevation: d => d.val
        });
        this.layers.push(this.h3Layer);
    }
    addMask(){

    }
}