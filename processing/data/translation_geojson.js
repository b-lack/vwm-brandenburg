/**
 * node processing/data/translation_geojson.js --fileName /Users/b-mac/sites/lfb/vwm-translation/raw-data/ivus_verbiss.geojson --attributeName verbissproz_ob_drittel
 * node processing/data/translation_geojson.js --fileName /Users/b-mac/sites/lfb/vwm-translation/raw-data/ivus_schaele.geojson --attributeName Proz
 * 
 * node processing/data/translation_geojson.js --fileName /Users/b-mac/sites/lfb/vwm-translation/raw-data/vwm_gesamt.geojson --attributeName verbissen%
 * node processing/data/translation_geojson.js --fileName /Users/b-mac/sites/lfb/vwm-translation/raw-data/vwm_gesamt.geojson --attributeName Proz
 */



const fs = require('fs');
const { exit } = require('process');
const path = require('path');

var argv = require('minimist')(process.argv.slice(2));

if(typeof argv.fileName === "undefined") {
    console.warn('"--fileName" attribute missing');
    process.exit(1);
}else{
    FILEPATH = argv.fileName;
}
if(typeof argv.attributeName === "undefined") {
    console.warn('"--attributeName" attribute missing');
    process.exit(1);
}else{
    ATTRIBUTENAME = argv.attributeName;
}

var fileName = path.basename(FILEPATH).split('.')[0];

let jsonOutput = [];

function translateFeature(feature){
    const valObj = {
        x: feature.geometry.coordinates[1],
        y: feature.geometry.coordinates[0],
        val: parseFloat(feature.properties[ATTRIBUTENAME]) || 0
    };
    jsonOutput.push(valObj)
}
function writeFile(){
    fs.writeFileSync(__dirname + '/../tmp/survey-data/' + fileName + '.json', JSON.stringify(jsonOutput), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '.json');
    });
}
console.log(FILEPATH);
const toFillPoints = fs.readFileSync(FILEPATH);
const toFillPointsObj = JSON.parse(toFillPoints);

for(var i of toFillPointsObj.features){
    translateFeature(i);
}

writeFile()
