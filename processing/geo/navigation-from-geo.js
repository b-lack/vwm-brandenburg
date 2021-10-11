/*
    example 
    node processing/geo/navigation-from-geo.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/oberfoerstereien.geojson --outputName obf --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/src/geo-resolution/ --year=2020
    node processing/geo/navigation-from-geo.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/reviere.geojson --outputName reviere --outputDir=/Users/b-mac/sites/lfb/vwm-brandenburg/src/geo-resolution/ --year=2020
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
let YEAR;

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
if(typeof argv.year === "undefined") {
    console.warn('"--year" attribute missing');  
    process.exit(1);
}else{
    YEAR = argv.year;
}

if (!fs.existsSync(DESTINATION)){
    fs.mkdirSync(DESTINATION, { recursive: true });
}

const rawdata = fs.readFileSync(FEATURCOLLECTIONFILE);
const featureCollection = JSON.parse(rawdata);

let OUTPUTLIST = [];

function aggregation(fid, year, directory, resolution){

    const OUTPUTDIRECTORY = __dirname + '/../../docs/interpolation/' + year + '/' + directory + '/' + resolution + '/';

    let valuesStr = fs.readFileSync(OUTPUTDIRECTORY + 'fid_' + fid + '_' + resolution + '.json');
    let valuesArray = JSON.parse(valuesStr);
    let value = 0;
    for(var i of valuesArray){
        value += i.val;
    }

    return Math.round(value/valuesArray.length * 100) / 100;
}

for(var feature of featureCollection.features){
    let obj = {
        id: feature.properties.fid,
        name: feature.properties.name,
        obf: parseInt(feature.properties.obf),
        agg:{
            '2020':{
                ivus_schaele: aggregation(feature.properties.fid, '2020', 'ivus_schaele', OUTPUTNAME == 'reviere' ? 10 : 9),
                ivus_verbiss: aggregation(feature.properties.fid, '2020', 'ivus_verbiss', OUTPUTNAME == 'reviere' ? 10 : 9)
            },
            '2021':{
                ivus_schaele: aggregation(feature.properties.fid, '2021', 'ivus_schaele', OUTPUTNAME == 'reviere' ? 10 : 9),
                ivus_verbiss: aggregation(feature.properties.fid, '2021', 'ivus_verbiss', OUTPUTNAME == 'reviere' ? 10 : 9)
            }
        }
    };
    OUTPUTLIST.push(obj);
}

var saveTo = DESTINATION + OUTPUTNAME + '.json';

fs.writeFileSync(saveTo, JSON.stringify(OUTPUTLIST), function (err) {
    if (err) return console.log(err);
    console.log('written file:',  saveTo);
});