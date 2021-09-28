/*
    example 
    node processing/point-in-polygon.js
*/
import fs from 'fs';
import h3 from 'h3-js';
import pointsWithinPolygon from '@turf/points-within-polygon';
import turf from 'turf';

const rawdata = fs.readFileSync('/Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/waldflaechen_puffer_75m_siml.geojsonl.json');
const featureCollection = JSON.parse(rawdata);

let RESOLUTION = 8;

//turf.pointsWithinPolygon

/*var ptsWithin = pointsWithinPolygon(
    {
        type: "MultiPoint",
        coordinates: [[13.5822,52.9572]]
    }
    , featureCollection.features[0].geometry.coordinates
);*/

for(var i in featureCollection.geometry.coordinates){
    var hexa = h3.polyfill(featureCollection.geometry.coordinates[i], RESOLUTION, true)

    console.log(hexa);

    /*var ptsWithin = pointsWithinPolygon(
        {
            type: "MultiPoint",
            coordinates: [[13.53011,52.72600]]
        }
        , { "type": "Polygon",
            "coordinates": [
                featureCollection.geometry.coordinates[i]
            ]
        }
    );
    if(ptsWithin.features.length)
        console.log(ptsWithin);*/
}