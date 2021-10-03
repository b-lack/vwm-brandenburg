/*
    example 
    node processing/geo/mask-from-feature-collection.js --property fid --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/oberfoerstereien.geojson --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/example/geo/obf
    node processing/geo/mask-from-feature-collection.js --property fid --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/reviere.geojson --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/example/geo/reviere
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let FEATURCOLLECTIONFILE;
let DESTINATION;
let PROPERTY;

if(typeof argv.featureFile === "undefined") {
    console.warn('"--featureFile" attribute missing');  
    process.exit(1);
}else{
    FEATURCOLLECTIONFILE = argv.featureFile;
}
if(typeof argv.outputDir === "undefined") {
    console.warn('"--outputDir" attribute missing');  
    process.exit(1);
}else{
    DESTINATION = argv.outputDir;
}
if(typeof argv.property === "undefined") {
    console.warn('"--property" attribute missing');  
    process.exit(1);
}else{
    PROPERTY = argv.property;
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

/*for(feature of featureCollection.features){
    if(!sortReviereByObf[feature.properties.obf]) sortReviereByObf[feature.properties.obf] = [];
    sortReviereByObf[feature.properties.obf].push(feature)
}*/

for(var feature of featureCollection.features){
    console.log(feature);
    var obfFeatureCollection = {
        "type": "FeatureCollection",
        "name": feature.properties[PROPERTY],
        "features": [feature]
    };

    //fs.writeFile(DESTINATION + '/' + sortReviereByObf[obf].obf + '.geojson', JSON.stringify(obfFeatureCollection));
    
    var saveTo = DESTINATION + '/' + feature.properties[PROPERTY] + '.geojson';
    fs.writeFileSync(saveTo, JSON.stringify(obfFeatureCollection), function (err) {
        if (err) return console.log(err);
        console.log(saveTo);
    });
}