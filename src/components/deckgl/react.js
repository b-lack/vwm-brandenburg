import React, {useState, useEffect} from 'react';
import {FlyToInterpolator} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {TileLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';
import {bboxPolygon, difference, bbox as turfbbox, centroid as turfcentroid} from '@turf/turf';
import { getRange } from '../bb/dashboard';

const INITIAL_VIEW_STATE = {
    latitude: 52.459028, 
    longitude: 13.015833,
    zoom: 7,
    minZoom: 7,
    maxZoom: 14,
    pitch: 0,
    bearing: 0
};


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
}

function getTooltip({object}, layer) {
  if (!object || !layer) {
    return null;
  }
  var value = Math.round(object.val).toString();

  var toolTip = document.getElementsByClassName('deck-tooltip');
  if(toolTip.length>0){
    var geToolTip = toolTip[0].getElementsByClassName('ge-info-range-indicator')
    if(geToolTip.length> 0){
      geToolTip[0].style.left = Math.max(0, Math.min(100, object.val)) + '%';
      toolTip[0].getElementsByClassName('ge-tooltip-value')[0].innerText = value.toString();
      toolTip[0].getElementsByClassName('ge-tooltip-label')[0].innerText = layer == 'ivus_schaele'?'Schälprozent':'Verbissprozent';
      return {
        "style": {}
      };
    }
  }

  return {
    'html': `
      <div class="ge-tool-tip"><span class="ge-tooltip-label">${layer=='ivus_schaele'?'Schälprozent':'Verbissprozent'}</span> <span class="ge-tooltip-value">${value}</span>% 
      <br/>${getRange(value).outerHTML}</div>
      `
  }

  return `\
    ${layer=='ivus_schaele'?'Schälprozent':'Verbissprozent'} ${value} %`;
}

/* eslint-disable react/no-deprecated */
export default function ReactApp({
  data,
  maskData,
  childMaskData,
  parent,
  show3D,
  resolution,
  layer,
  pitch
}) {
    let currentPosition = [];
    let stateView = null;
    let currentPitch = 0;
    const [currpitch, setCurrpitch] = useState(INITIAL_VIEW_STATE.pitch)
    const [position, setPosition] = useState({latitude: INITIAL_VIEW_STATE.latitude, longitude: INITIAL_VIEW_STATE.longitude})
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
      })
  ];
  if(maskData){
    layers.push(new GeoJsonLayer({
      id: 'mask-layer-0_8',
      data: polyMask(maskData),
      getFillColor: [251,251,251,255],
      stroked: false,
      extruded: false,
      wireframe: true,
      lineJointRounded: true,
    }))
    if(childMaskData){
      layers.push(new GeoJsonLayer({
        id: 'child-mask-layer-0_8',
        data: polyMask(childMaskData),
        getFillColor: [255,255,255,150],
        stroked: false,
        extruded: false,
        wireframe: true,
        lineJointRounded: true
      }))
    }
  }
  layers.push(
    new H3HexagonLayer({
      id: '',
      data: data,
      pickable: true,
      wireframe: false,
      filled: true,
      extruded: true,
      elevationRange: [0, 3000],
      elevationScale: 30,
      coverage: 0.9,
      visible: true,
      getHexagon: d =>  d.hex || d.hex10,
      getFillColor: d => [...perc2color(100-d.val), 150], //[( d.val / 100) * 157, (1 - d.val / 100) * 255, 157, 150],
      getElevation: d => show3D ? d.val : 0,
      updateTriggers: {
          getElevation: [
              show3D
          ]
      },
      transitions: {
        getElevation: 600,
        getFillColor: 600
      }
    })
  );
  const onDrag = (info, e) =>{
    if(info.viewport)
      setZoom(info.viewport.zoom);
  }
  const onViewStateChange = (e) => {
    
    e.viewState.bearing = 0;

    const bbox = [
      11.265772516621665,
      51.35900807904211,
      14.76570064949395,
      53.5590504652457
    ];

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

    parent(e)
  
    return e.viewState;
  }
  useEffect(()=>{

    var centroid;

    
    if(!childMaskData && maskData){
      centroid = turfcentroid(maskData);
    }else if(childMaskData){
      centroid = turfcentroid(childMaskData);
    }

    setInitialViewState({
      longitude: centroid.geometry.coordinates[0],
      latitude: centroid.geometry.coordinates[1],
      zoom: resolution == 8 ? 7 : resolution == 9 ? 9 : 10,
      minZoom: 7,
      maxZoom: 14,
      pitch: pitch,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    });
    
  }, [childMaskData, pitch])

  return (
    <DeckGL
      layers={layers}
      initialViewState={initialViewState}
      controller={true}
      onViewStateChange={onViewStateChange}
      onDragEnd={onDrag}
      getTooltip={(e) => getTooltip(e, layer)}
    >
      
    </DeckGL>
  );
}