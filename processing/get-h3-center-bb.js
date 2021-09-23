/*
    example 
    node get-h3-center-bb.js --inputFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/verbiss_ausw_fl_ba_2020.csv
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));





if(typeof argv.resolution === "undefined") {
    console.warn('"--resolution" attribute missing');
    process.exit(1);
}

const RESOLUTION = argv.resolution;

const rawdata = fs.readFileSync('../data/land_small.json');
const landOutlines = JSON.parse(rawdata);

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
});