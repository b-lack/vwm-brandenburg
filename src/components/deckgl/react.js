import React, {useState, useCallback, useEffect} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {WebMercatorViewport, FlyToInterpolator, AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import DeckGL from '@deck.gl/react';
import {TileLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';
import * as turf from '@turf/turf';

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/3d-heatmap/heatmap-data.csv'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight1 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-0.144528, 49.739968, 80000]
});

const pointLight2 = new PointLight({
  color: [255, 255, 255],
  intensity: 0.8,
  position: [-3.807751, 54.104682, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight1, pointLight2});

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
    minZoom: 6,
    maxZoom: 14,
    pitch: 0,
    bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export const colorRange = [
  [1, 152, 189],
  [73, 227, 206],
  [216, 254, 181],
  [254, 237, 177],
  [254, 173, 84],
  [209, 55, 78]
];

function getTooltip({object}) {
  if (!object) {
    return null;
  }
  //const lat = object.position[1];
  //const lng = object.position[0];
  var value = Math.round(object.val).toString();

  return `\
    ${value} %`;
}

/* eslint-disable react/no-deprecated */
export default function ReactApp({
  data,
  maskData,
  childMaskData,
  parent,
  show3D,
  resolution,
  mapStyle = MAP_STYLE,
  radius = 1000,
  upperPercentile = 100,
  coverage = 1
}) {

    let stateView = null;
    //const [viewport, setViewport] = useState({})
    const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom)
    const [initialViewState, setInitialViewState] = useState(INITIAL_VIEW_STATE);

    const polyMask = (isochrone) => {
        const bboxPoly = turf.bboxPolygon([-180, -85, 180, 85]);
        const mask = turf.difference(bboxPoly, isochrone);
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
        getFillColor: [255,255,255,255],
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
      getFillColor: d => [( d.val / 100) * 157, (1 - d.val / 100) * 255, 157, 150], // 157, 181, 157
      getElevation: d => show3D ? d.val : 0,
      updateTriggers: {
          getElevation: [
              show3D
          ]
      },
      material,
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
    
    var bbox = turf.bbox(maskData);

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
    var centroid = turf.centroid(childMaskData);

    setInitialViewState({
      //{...INITIAL_VIEW_STATE},
      longitude: centroid.geometry.coordinates[0],
      latitude: centroid.geometry.coordinates[1],
      zoom: resolution == 8 ? 7 : resolution == 9 ? 9 : 10,
      pitch: 0,
      bearing: 0,
      transitionDuration: 1000,
      transitionInterpolator: new FlyToInterpolator()
    });
  }, [childMaskData])

  return (
    <DeckGL
      layers={layers}
      //effects={[lightingEffect]}
      initialViewState={initialViewState}
      controller={true}
      onViewStateChange={onViewStateChange}
      onDragEnd={onDrag}
      getTooltip={getTooltip}
    >
      
    </DeckGL>
  );
}