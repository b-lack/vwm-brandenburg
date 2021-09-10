import React from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {HexagonLayer} from '@deck.gl/aggregation-layers';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import DeckGL from '@deck.gl/react';

// Source data CSV
//const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/sf.h3cells.json'; // eslint-disable-line
const DATA_URL = './data/verbiss_ausw_fl_ba_2020.csv'// eslint-disable-line

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
  longitude: 13.015833,
  latitude: 52.459028,
  zoom: 6.6,
  minZoom: 5,
  maxZoom: 15,
  pitch: 40.5,
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
  const lat = object[0];
  const lng = object[1];
  const hex = object[2];
  const value = object[3];
  //const count = object.points.length;

  return `\
    latitude: ${Number.isFinite(lat) ? lat.toFixed(6) : ''}
    longitude: ${Number.isFinite(lng) ? lng.toFixed(6) : ''}
    hex7: ${hex}
    Terminalverbiss im oberen drittel : ${value} %`;
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  mapStyle = MAP_STYLE,
  radius = 1100,
  upperPercentile = 100,
  coverage = 0.9
}) {
  const layers = [
    new H3HexagonLayer({
        id: 'h3-hexagon-layer',
        coverage,
        data,
        pickable: true,
        wireframe: false,
        filled: true,
        extruded: true,
        elevationScale: data && data.length ? 50 : 0,
        getHexagon: d => d[2],
        getFillColor: d => [255, (1 - d[3] / 100) * 255, 0],
        getElevation: d => d[3]
    })/*,
    new HexagonLayer({
      id: 'heatmap',
      colorRange,
      coverage,
      data,
      elevationRange: [0, 3000],
      elevationScale: data && data.length ? 20 : 0,
      extruded: true,
      getPosition: d => d,
      pickable: false,
      radius,
      upperPercentile,
      material,
      transitions: {
        elevationScale: 3000
      }
    })*/
  ];

  return (
    <DeckGL
      layers={layers}
      effects={[lightingEffect]}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <StaticMap reuseMaps mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

//render(<APP />, document.body.appendChild(document.createElement('div')));
export function renderToDOM(container) {
  render(<App />, container);

  require('d3-request').csv(DATA_URL, (error, response) => {
    if (!error) {
      const data = response.map(d => [Number(d.longitude), Number(d.latitude), d.hex7, Number(d.Terminalv_zz__ob_1_3_zz_Altv_Proz)]);
      render(<App data={data} />, container);
    }
  });
}