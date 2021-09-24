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

const PATHTOSAVE = __dirname +'/tmp/obf/';
const OBFLIST = [];

if(typeof argv.featureFile === "undefined") {
    console.warn('"--featureFile" attribute missing');
    process.exit(1);
}else{
    FEATURCOLLECTIONFILE = argv.featureFile;
}

if(typeof argv.resolution === "undefined") {
    console.warn('"--resolution" attribute missing');
    process.exit(1);
}else{
    RESOLUTION = argv.resolution;
}


const rawdata = fs.readFileSync(FEATURCOLLECTIONFILE);
const featureCollection = JSON.parse(rawdata);

const forestdata = fs.readFileSync('/Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/waldflaechen_puffer_75m_siml.geojsonl.json');
const featureForest = JSON.parse(forestdata);

async function featureToJson(element){

    let hexagons = [];

    element.geometry.coordinates.forEach(polygon => {
        hexagons = [...hexagons, ...h3.polyfill(polygon[0], RESOLUTION, true)];
    });

    return {
        properties: element.properties,
        hexagons: hexagons
    };
}

async function saveJsonToDist(name, data){
    var nameToSave = data.properties.obf + '_' + RESOLUTION +'.json'
    OBFLIST.push({
        filePath: PATHTOSAVE,
        fileName:nameToSave,
        properties: data.properties
    });
    return fsP.writeFile(PATHTOSAVE + nameToSave, JSON.stringify(data));
}

async function parseFeatureCollection(featureCollection){
    for (const feature of featureCollection.features) {
        data = await featureToJson(feature);
        await saveJsonToDist(data.properties.name, data);
        console.log('saved: ', data.properties.name);
    }

    
    fs.writeFile(PATHTOSAVE + '_obf-list.json', JSON.stringify(OBFLIST), function (err) {
        if (err) return console.log(err);
        console.log('written file:',  PATHTOSAVE + '_obf-list.json');
    });
}

if (fs.existsSync(PATHTOSAVE)){
    fs.rmdirSync(PATHTOSAVE, { recursive: true });
}
if (!fs.existsSync(PATHTOSAVE)){
    fs.mkdirSync(PATHTOSAVE, { recursive: true });
}


parseFeatureCollection(featureCollection);



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