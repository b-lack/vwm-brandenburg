/**
 * Splits FeatureCollection into multiple Features named by defined property.
 * The resulting features are used as a mask.
 * Saves files as zipped gzip.
 * @param {string} property - Name of the property used as feature name and file name
 * @param {string} featureFile - Input geojson FeatureCollection
 * @param {string} outputDir - Output directory
 */

require('dotenv').config()

const fs = require('fs');
const pako = require('pako')

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
    DESTINATION = __dirname + '/../../docs/geo/' + argv.outputDir;
}
if(typeof argv.property === "undefined") {
    if(process.env.MASK_PROPERTY){
        PROPERTY = process.env.MASK_PROPERTY
        console.log(PROPERTY);
    }else{
        console.warn('"--property" attribute missing');  
        process.exit(1);
    }
    
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

if(!featureCollection.features){
    console.warn('is not a Featurecollection');  
    process.exit(1);
}

const savedList = [];

for(var feature of featureCollection.features){
    if(!feature.properties[PROPERTY]){
        console.warn('property "' + PROPERTY + '" cannot be found in feature.');  
        process.exit(1);
    }

    var obfFeatureCollection = {
        "type": "FeatureCollection",
        "name": feature.properties[PROPERTY],
        "features": [feature]
    };
    
    var saveTo = DESTINATION + '/' + feature.properties[PROPERTY] + '.geojson';
    savedList.push('./geo/' + feature.properties[PROPERTY] + '.geojson.gzip');

    fs.writeFileSync(saveTo + '.gzip', pako.deflate(JSON.stringify(obfFeatureCollection)));
    console.log('written file:', saveTo);
}

fs.writeFileSync(DESTINATION + '/all.json', JSON.stringify(savedList));
console.log('written file:', DESTINATION + '/all.json');