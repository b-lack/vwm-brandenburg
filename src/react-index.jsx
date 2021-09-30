import './css/styles.css';
import React from 'react';
import {render} from 'react-dom';
import * as APP from './components/react-map/map'

export function renderToDOM(container) {
    console.log(APP.default);
    render(<APP.default />, container);
  
    require('d3-request').csv(DATA_URL, (error, response) => {
      if (!error) {
        const data = response.map(d => [Number(d.lng), Number(d.lat)]);
        console.log(data);
        render(<APP.default data={data} />, container);
      }
    });
}

export default APP;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        /*navigator.serviceWorker.register('sw.js');*/
    });
}