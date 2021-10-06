import {Deck, WebMercatorViewport, FlyToInterpolator} from '@deck.gl/core';
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
        this.h3Resolutions = {}
        this.maskLayers = {};
        this.getElevation = false;
    }
    init(){
        this.deckgl = new Deck({
            canvas: 'ge-canvas',
            container: this.elementId,
            initialViewState: this.INITIAL_VIEW_STATE,
            controller: true,
            layers: this.layers,
            onViewStateChange: ({viewState}) => {
                
                if(this.getElevation !== viewState.pitch > 0){
                    this.getElevation = viewState.pitch > 0;
                    this.setElevation();
                }
                //console.log( viewState, this.getElevation );
            },
            getTooltip: ({object}) => object && this.showToolTip(object)
        });
        this.createBaseMap();
        //this.createPolygonsByH3();
    }
    showToolTip(object){
        var value = Math.round(object.val).toString();
        return {
            html: `<div>${value} %</div>`,
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
    addMask(preId, data, featureId, resolution){

        let found = false;

        for( var i in this.layers){
            console.log(this.layers[i]);
            if(this.layers[i].id.startsWith(preId) && this.layers[i].id !== 'mask-layer-0_8')
                this.layers[i] = this.layers[i].clone({visible: false})

            if(this.layers[i].id === preId + featureId + '_' + resolution){
                this.layers[i] = this.layers[i].clone({visible: true})
                found = true;
            }
        }

        if(!found){
            this.createMaskLayer(preId, data, featureId, resolution);
        }
    }
    createMaskLayer(preId, data, featureId, resolution){
        console.log(preId + featureId + '_' + resolution);
        this.maskLayer = new GeoJsonLayer({
            id: preId + featureId + '_' + resolution,
            data: this.polyMask(data),
            getFillColor: preId + featureId + '_' + resolution == 'mask-layer-0_8' ? [255,255,255,255] : [255,255,255,150],
            stroked: false,
            extruded: false,
            wireframe: true,
            lineJointRounded: true,
        });
        this.layers.push(this.maskLayer);
        
        //this.deckgl.setProps({ layers: [...[this.maskLayer]] });
        this.fitBounds(data, resolution);
        /*
        console.log(this.maskLayer);
        if(this.maskLayer){
            this.maskLayer = new GeoJsonLayer({
                id: preId + featureId + '_' + resolution,
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
                id: preId + featureId + '_' + resolution,
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
        }*/
    }
    polyMask = (isochrone) => {
        const bboxPoly = turf.bboxPolygon([-180, -85, 180, 85]);
        const mask = turf.difference(bboxPoly, isochrone);
        return mask;
    }
    fitBounds(feature, resolution){
        this.lastMask = feature;

        var bbox = turf.bbox(feature);
        const viewport = new WebMercatorViewport(this.deckgl.viewState);
        
        let {bearing, pitch} = viewport;
        let {longitude, latitude, zoom} = viewport.fitBounds([
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]]
        ]);

        zoom = resolution == 8 ? 7 : resolution;

        
        this.deckgl.setProps({
            initialViewState: {longitude, latitude, zoom, bearing, pitch}
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
    getLayerById(id){
        return this.layers.filter(elem => elem.id === id);
    }
    setElevation(){
        for( var i in this.layers){
            this.layers[i] = this.layers[i].clone({getElevation: d => this.getElevation ? d.val : 0})
        }
        console.log('change setElevation');
    }
    addPolygonsByH3(preId, data, featureId, resolution, layer, year, force){
        const layerId = preId + featureId + '_' + resolution + '_' + layer;
        console.log(layerId, force);

        for( var i in this.layers){
            if(this.layers[i].id === 'hey'){
                this.layers.splice(i, 1)
                
            }
                
            /*if(this.layers[i].id.startsWith(preId))
                this.layers[i] = this.layers[i].clone({visible: false})
            if(this.layers[i].id === layerId){
                console.log('visible: ', layerId);
                this.layers[i] = this.layers[i].clone({visible: true})
            }*/
        }
        console.log('dsfsfsdffsdf: Update');
        this.layers.push(this.createPolygonsByH3(data, 'hey'));
            //this.deckgl.setProps({layers: this.layers})
        if(!this.deckgl) return;
        var newState = this.INITIAL_VIEW_STATE;
        newState.latitude = this.deckgl.viewState.latitude;
        newState.longitude = this.deckgl.viewState.longitude;
        console.log('setProps', this.deckgl.viewState);
        this.deckgl.setProps({
            layers: this.layers,
            initialViewState: {...newState, transitionInterpolator: new FlyToInterpolator({speed: 0.5}),
            transitionDuration: 0}
        })
        return;

        if(!this.h3Resolutions[layerId]){
            
            this.h3Resolutions[layerId] = true;
            
            this.createPolygonsByH3(data, layerId);

        }else if(force){
            this.h3Resolutions[layerId] = true;
            for( var i in this.layers){
                if(this.layers[i].id === layerId){
                    //this.layers[i] = this.layers[i].clone({data: data})

                    //this.layers[i] = this.layers[i].clone({getElevation: d => this.getElevation ? d.val : 0})
                    this.layers.splice(i, 1)
                    //console.log('GET UPDATE: getElevation', this.layers[i]);
                    /*this.layers[i].setProps({
                        getElevation: d => this.getElevation ? d.val : 0,
                        updateTriggers: {
                            getElevation: this.getElevation
                        }
                    });*/
                }
            }
            this.createPolygonsByH3(data, layerId);

            //this.deckgl.redraw(true);
            /*this.deckgl.setProps({
                initialViewState: {longitude, latitude, zoom, bearing, pitch}
            });*/
            
        }
        this.deckgl.setProps({layers: this.layers})
        this.deckgl.redraw(true);
        console.log('ADD LAYER', this.layers);
        
    }
    //https://stackoverflow.com/questions/7128675/from-green-to-red-color-depend-on-percentage
    createPolygonsByH3(data, layerId){
        
        var h3Layer = new H3HexagonLayer({
            id: layerId,
            data: data,
            pickable: true,
            wireframe: false,
            filled: true,
            extruded: true,
            elevationScale: 25,
            coverage: 0.9,
            visible: true, //this.h3Resolutions[layerId],
            getHexagon: d =>  d.hex || d.hex10,
            getFillColor: d => [( d.val / 100) * 157, (1 - d.val / 100) * 255, 157, 150], // 157, 181, 157
            getElevation: d => this.getElevation ? d.val : 0
        });

        //this.layers.push(h3Layer);
        return h3Layer;
    }
}
/*
// Wenn 100%
100 / 100 * 157 = 157 
(1 - 100 / 100) * 181 = 0

// Wenn 0%
0 / 100 * 157 = 0 
(1 - 0 / 100) * 181 = 181
*/