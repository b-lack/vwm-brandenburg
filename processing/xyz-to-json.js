const fs = require('fs');
const csv = require('csv-parser');
const h3 = require("h3-js");

const OBJ = {}
const RESOLUTION = 7;
const OUTPUT_FILENAME = 'bb';

addLine = function(line, resulution = RESOLUTION){
    if(parseFloat(line.z)){

        const hex = h3.geoToH3(line.y, line.x, resulution);

        if(typeof OBJ[hex] == "undefined") {
            OBJ[hex] = {
                coordinates: [h3.h3ToGeoBoundary(hex, true)],
                percent: [],
                count:0
            }
        }
        OBJ[hex].percent.push(parseFloat(line.z))
    }
}

avgObj = function(jsonObj, geojson = true){
    const featureCollection = {
        type: "FeatureCollection",
        features: []
    };
    const newObj = {};
    for(let i in jsonObj){
        const sum = jsonObj[i].percent.reduce((a, b) => a + b, 0);
        newObj[i] = {};
        newObj[i].avg = Math.round(sum / jsonObj[i].percent.length * 100) / 100 || 0;
        newObj[i].count = jsonObj[i].percent.length
        newObj[i].coordinates = jsonObj[i].coordinates

        featureCollection.features.push({
            type:"Feature",
            geometry:{
                type:"Polygon",
                coordinates: jsonObj[i].coordinates,
            },
            properties: {
                avg: newObj[i].avg,
                count: newObj[i].count
            }
        });
    }
    if(geojson) return featureCollection;
    return newObj;
}

writeFile = function(obj){
    fs.writeFile('../data/' + OUTPUT_FILENAME + '_' + RESOLUTION + '_geo.json', JSON.stringify(avgObj(OBJ, true)), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + OUTPUT_FILENAME + '_' + RESOLUTION + '_geo.json');
    });
    fs.writeFile('../data/' + OUTPUT_FILENAME + '_' + RESOLUTION + '_min.json', JSON.stringify(avgObj(OBJ, false)), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + OUTPUT_FILENAME + '_' + RESOLUTION + '_min.json');
    });
}


fs.createReadStream('./dist/h3_center_7 copy.csv').pipe(csv({
    separator: ','
    }))
    .on('data', (row) => {
        addLine(row, RESOLUTION);
    })
    .on('end', () => {
        writeFile(OBJ)
    });