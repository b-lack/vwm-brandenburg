import React from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {H3HexagonLayer} from '@deck.gl/geo-layers';
import DeckGL, {GeoJsonLayer, ArcLayer} from 'deck.gl';

const DATA_URL = '../data/verbiss_ausw_fl_ba_2020.csv'// eslint-disable-line
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

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

function APP(data) {
  const onClick = info => {
    if (info.object) {
      // eslint-disable-next-line
      alert(`${info.object.properties.name} (${info.object.properties.abbrev})`);
    }
  };

  return (
    <DeckGL
      controller={true}
      effects={[lightingEffect]}
      controller={true}
      initialViewState={INITIAL_VIEW_STATE}
      getTooltip={getTooltip}
      >
      <H3HexagonLayer
        id="h3-hexagon-layer"
        coverage = {0.9}
        pickable={true}
        wireframe={false}
        filled={true}
        extruded={true}
        elevationScale={data && data.length ? 50 : 0}

        getHexagon={d => d[2]}
        getFillColor={d => [255, (1 - d[3] / 100) * 255, 0]}
        getElevation={d => d[3]}
      />
    </DeckGL>
  );
}

/* global document */
render(<APP />, document.body.appendChild(document.createElement('div')));
require('d3-request').csv(DATA_URL, (error, response) => {
  if (!error) {
    console.log('LOADED');
    const data = response.map(d => [Number(d.longitude), Number(d.latitude), d.hex7, Number(d.Terminalv_zz__ob_1_3_zz_Altv_Proz)]);
    render(<App data={data} />, document.body.appendChild(document.createElement('div')));
  }
});