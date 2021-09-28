/*
    Creates H3 List per OBF
    example 
    node processing/geo-json-feature-to-h3.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/reviere.geojson --outputDir reviere --propertyId fid --resolution 9
    node processing/geo-json-feature-to-h3.js --featureFile /Users/b-mac/sites/lfb/vwm-translation/raw-data/geo/oberfoerstereien.geojson --outputDir obf --propertyId fid --resolution 8
*/

const proj4 = require('proj4')
const h3 = require("h3-js");
const csv = require('csv-parser');
const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let RESOLUTION;
let FEATURCOLLECTIONFILE;
let PATHTOSAVE;
let PROPERTYID;

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
if(typeof argv.outputDir === "undefined") {
    console.warn('"--outputDir" attribute missing');
    process.exit(1);
}else{
    PATHTOSAVE = __dirname +'/tmp/' + argv.outputDir + '/' + RESOLUTION + '/';
}
if(typeof argv.propertyId === "undefined") {
    console.warn('"--propertyId" attribute missing');
    process.exit(1);
}else{
    PROPERTYID = argv.propertyId;
}

const rawdata = fs.readFileSync(FEATURCOLLECTIONFILE);
const featureCollection = JSON.parse(rawdata);

const forestdata = fs.readFileSync('processing/tmp/bb/h3_on_forest_' + RESOLUTION+ '.json');
const ARRAYOFH3ONFOREST = JSON.parse(forestdata);

function checkH3IsOnForest(h3Array){
    return  ARRAYOFH3ONFOREST.filter(value => h3Array.includes(value));

    isOnForest = [];
    for(var h3 of h3Array){
        if(ARRAYOFH3ONFOREST.includes(h3)) isOnForest.push(h3);
    }
    return isOnForest
}

async function featureToJson(element){

    let hexagons = [];

    element.geometry.coordinates.forEach(polygon => {
        var h3sInPoly = h3.polyfill(polygon[0], RESOLUTION, true);
        hexagons = [...hexagons, ...h3sInPoly];
    });

    return {
        properties: {
            name: element.properties.name,
            id: element.properties[PROPERTYID]
        },
        hexagons: hexagons
    };
}

async function saveJsonToDist(name, data){
    var nameToSave = PROPERTYID + '_' + data.properties.id + '_' + RESOLUTION +'.json'
    OBFLIST.push({
        filePath: PATHTOSAVE,
        fileName:nameToSave,
        properties: data.properties
    });
    console.log('saving: ', PATHTOSAVE + nameToSave);
    return fsP.writeFile(PATHTOSAVE + nameToSave, JSON.stringify(data));
}

async function parseFeatureCollection(featureCollection){
    for (const feature of featureCollection.features) {
        data = await featureToJson(feature);
        await saveJsonToDist(data.properties.name, data);
        console.log('saved: ', data.properties.name);
    }

    
    fs.writeFile(PATHTOSAVE + '_list.json', JSON.stringify(OBFLIST), function (err) {
        if (err) return console.log(err);
        console.log('written file:',  PATHTOSAVE + '_list.json');
    });
}

/*
if (fs.existsSync(PATHTOSAVE)){
    fs.rmdirSync(PATHTOSAVE, { recursive: true });
}
*/
if (!fs.existsSync(PATHTOSAVE)){
    fs.mkdirSync(PATHTOSAVE, { recursive: true });
}


parseFeatureCollection(featureCollection);