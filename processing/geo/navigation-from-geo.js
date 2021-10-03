/*
    example 
    node processing/geo/navigation-from-geo.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/oberfoerstereien.geojson --outputName obf --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/src/geo-resolution/
    node processing/geo/navigation-from-geo.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/reviere.geojson --outputName reviere --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/src/geo-resolution/
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let FEATURCOLLECTIONFILE;
let DESTINATION;
let OUTPUTNAME;

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
if(typeof argv.outputName === "undefined") {
    console.warn('"--outputName" attribute missing');  
    process.exit(1);
}else{
    OUTPUTNAME = argv.outputName;
}


if (!fs.existsSync(DESTINATION)){
    fs.mkdirSync(DESTINATION, { recursive: true });
}

const rawdata = fs.readFileSync(FEATURCOLLECTIONFILE);
const featureCollection = JSON.parse(rawdata);

let OBFLIST = [];

for(var feature of featureCollection.features){
    OBFLIST.push({
        id: feature.properties.fid,
        name: feature.properties.name,
        obf: parseInt(feature.properties.obf)
    });
}

var saveTo = DESTINATION + OUTPUTNAME + '.json';
console.log(saveTo, OBFLIST);
fs.writeFileSync(saveTo, JSON.stringify(OBFLIST), function (err) {
    if (err) return console.log(err);
    console.log('written file:',  saveTo);
});