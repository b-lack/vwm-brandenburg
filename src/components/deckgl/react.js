import React, {useState, useCallback, useEffect} from 'react';
//import {render} from 'react-dom';
//import {StaticMap} from 'react-map-gl';
import {WebMercatorViewport, FlyToInterpolator} from '@deck.gl/core';
//import {HexagonLayer} from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import {TileLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';
//import * as turf from '@turf/turf';
import {bboxPolygon, difference, bbox as turfbbox, centroid as turfcentroid} from '@turf/turf';


const material = {
  ambient: 0.64,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [51, 51, 51]
};

const INITIAL_VIEW_STATE = {
    latitude: 52.459028, 
    longitude: 13.015833,
    zoom: 7,
    minZoom: 7,
    maxZoom: 14,
    pitch: 0,
    bearing: 0
};

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

function perc2color(perc) {
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
  return [r,g,b];
	return '#' + ('000000' + h.toString(16)).slice(-6);
}

function getTooltip({object}) {
  if (!object) {
    return null;
  }
  var value = Math.round(object.val).toString();

  return `\
    Schälprozent ${value} %`;
}

/* eslint-disable react/no-deprecated */
export default function ReactApp({
  data,
  maskData,
  childMaskData,
  parent,
  show3D,
  resolution,
  radius = 1000,
  upperPercentile = 100,
  coverage = 1
}) {

    let stateView = null;
    const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom)
    const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);

    const polyMask = (isochrone) => {
        const bboxPoly = bboxPolygon([-180, -85, 180, 85]);
        const mask = difference(bboxPoly, isochrone);
        return mask;
    }
    
    const layers = [
      new TileLayer({
        data: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png'
        ],
        maxRequests: 20,
        pickable: false,
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
      }),
      new GeoJsonLayer({
        id: 'mask-layer-0_8',
        data: polyMask(maskData),
        getFillColor: [251,251,251,255],
        stroked: false,
        extruded: false,
        wireframe: true,
        lineJointRounded: true,
      }),

  ];
  if(childMaskData){
      layers.push(new GeoJsonLayer({
        id: 'child-mask-layer-0_8',
        data: polyMask(childMaskData),
        getFillColor: [255,255,255,150],
        stroked: false,
        extruded: false,
        wireframe: true,
        lineJointRounded: true
      })
    )
  }
  layers.push(
    new H3HexagonLayer({
      id: '',
      data: data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationScale: 25,
      coverage: 0.9,
      visible: true, //this.h3Resolutions[layerId],
      getHexagon: d =>  d.hex || d.hex10,
      getFillColor: d => [...perc2color(100-d.val), 150], //[( d.val / 100) * 157, (1 - d.val / 100) * 255, 157, 150],
      getElevation: d => show3D ? d.val : 0,
      updateTriggers: {
          getElevation: [
              show3D
          ]
      },
      transitions: {
          elevationScale: 3000
      }
    })
  );

  /*layers.push(
    new HexagonLayer({
      id: 'heatmap',
      colorRange,
      coverage,
      data,
      elevationRange: [0, 3000],
      elevationScale: data && data.length ? 50 : 0,
      extruded: true,
      getPosition: d => d,
      pickable: true,
      radius,
      upperPercentile,
      material,
      transitions: {
          elevationScale: 3000
      }
    })
  );*/
  const onDrag = (info, e) =>{
    if(info.viewport)
      setZoom(info.viewport.zoom);
  }
  const onViewStateChange = (e) => {

    //setZoom(e.viewState.zoom);
    
    var bbox = turfbbox(maskData);

    if (e.viewState.latitude > bbox[3]) {
      e.viewState.latitude = bbox[3];
    }else if (e.viewState.latitude < bbox[1]) {
      e.viewState.latitude = bbox[1];
    }

    if (e.viewState.longitude > bbox[2]) {
      e.viewState.longitude = bbox[2];
    }else if (e.viewState.longitude < bbox[0]) {
      e.viewState.longitude = bbox[0];
    }

    e.viewState.bearing = 0;

    parent(e)
  
    // update mapbox
    return e.viewState;
  }
  useEffect(()=>{

    if(!childMaskData) return;
    var centroid = turfcentroid(childMaskData);

    setInitialViewState({
      //{...INITIAL_VIEW_STATE},
      longitude: centroid.geometry.coordinates[0],
      latitude: centroid.geometry.coordinates[1],
      zoom: resolution == 8 ? 7 : resolution == 9 ? 9 : 10,
      minZoom: 7,
      maxZoom: 14,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    });
  }, [childMaskData])

  return (
    <DeckGL
      layers={layers}
      initialViewState={initialViewState}
      controller={true}
      onViewStateChange={onViewStateChange}
      onDragEnd={onDrag}
      getTooltip={getTooltip}
    >
      
    </DeckGL>
  );
}