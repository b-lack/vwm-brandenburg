/*
    example 
    node processing/geo-json-feature-to-h3.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/oberfoerstereien.geojson --resolution 8
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let RESOLUTION;
let FEATURCOLLECTIONFILE;

if(typeof argv.resolution === "undefined") {
    console.warn('"--resolution" attribute missing');
    process.exit(1);
}else{
    RESOLUTION = argv.resolution;
}

const PATHTOSAVE = __dirname +'/tmp/bb/';
let H3LIST = [];

const forestdata = fs.readFileSync('/Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/waldflaechen_puffer_75m_siml.geojsonl.json');
const featureForest = JSON.parse(forestdata);

async function coordinateToJson(coordinate){
    return h3.polyfill(coordinate, RESOLUTION, true)
}

async function parseFeatureCollection(coordinates){
    for (let i in coordinates) {
        data = await coordinateToJson(coordinates[i]);
        H3LIST = [...H3LIST, ...data];
        console.log(i, '/', coordinates.length, 'Polygons : ', H3LIST.length, 'H3 - Points')
    }

    
    fs.writeFile(PATHTOSAVE + 'h3_on_forest_' + RESOLUTION + '.json', JSON.stringify(H3LIST), function (err) {
        if (err) return console.log(err);
        console.log('written file:',  PATHTOSAVE + 'h3_on_forest_' + RESOLUTION + '.json');
    });
}

if (fs.existsSync(PATHTOSAVE)){
    fs.rmdirSync(PATHTOSAVE, { recursive: true });
}
if (!fs.existsSync(PATHTOSAVE)){
    fs.mkdirSync(PATHTOSAVE, { recursive: true });
}


parseFeatureCollection(featureForest.geometry.coordinates);



/*

const hexagons = h3.polyfill(landOutlines.features[0].geometry.coordinates[0][0], RESOLUTION);

let csvOutput = '"y","x","z"\n';
for(let i in hexagons){
    center = h3.h3ToGeo(hexagons[i]);
    csvOutput += center[1] + ',' + center[0]  + ',\n'
}

const savePath = './dist/h3_center_' + RESOLUTION +'.csv';
fs.writeFile(savePath, csvOutput, function (err) {
    if (err) return console.log(err);
    console.log('written file: ' + savePath);
});


let jsonH3Output = [];
for(let i in hexagons){
    jsonH3Output.push([hexagons[i],Math.random()])
}

const saveH3Path = '../data/h3/h3_' + RESOLUTION +'.json';
fs.writeFile(saveH3Path, JSON.stringify(jsonH3Output), function (err) {
    if (err) return console.log(err);
    console.log('written file: ' + saveH3Path);
});*/