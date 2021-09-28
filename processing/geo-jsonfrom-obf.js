/*
    example 
    node processing/geo-jsonfrom-obf.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/reviere.geojson
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let FEATURCOLLECTIONFILE;

const DESTINATION = __dirname +'/../data/geo/reviere';

if(typeof argv.featureFile === "undefined") {
    console.warn('"--featureFile" attribute missing');  
    process.exit(1);
}else{
    FEATURCOLLECTIONFILE = argv.featureFile;
}

if (fs.existsSync(DESTINATION)){
    fs.rmdirSync(DESTINATION, { recursive: true });
}
if (!fs.existsSync(DESTINATION)){
    fs.mkdirSync(DESTINATION, { recursive: true });
}

const rawdata = fs.readFileSync(FEATURCOLLECTIONFILE);
const featureCollection = JSON.parse(rawdata);

let sortReviereByObf = {};

for(feature of featureCollection.features){
    if(!sortReviereByObf[feature.properties.obf]) sortReviereByObf[feature.properties.obf] = [];
    sortReviereByObf[feature.properties.obf].push(feature)
}

for(var obfId in sortReviereByObf){
    console.log(sortReviereByObf[obfId].length);
    var obfFeatureCollection = {
        "type": "FeatureCollection",
        "name": "reviere",
        "features": sortReviereByObf[obfId]
    };

    //fs.writeFile(DESTINATION + '/' + sortReviereByObf[obf].obf + '.geojson', JSON.stringify(obfFeatureCollection));
    
    var saveTo = DESTINATION + '/' + obfId + '.geojson';
    fs.writeFile(saveTo, JSON.stringify(obfFeatureCollection), function (err) {
        if (err) return console.log(err);
        console.log(saveTo);
    });
}