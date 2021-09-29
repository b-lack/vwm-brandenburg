const csv = require('csv-parser');
const fs = require('fs');
const proj4 = require('proj4')
const h3 = require("h3-js");
const { parse } = require('path');


const projections = {
    wgs84: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    ETRS89: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
};

const fileName = 'verbiss_ausw_fl_ba_2020';
const filePath = '/Users/b-mac/sites/lfb/vwm-translation/raw-data/'
let csvOutput = '';
let jsonOutput = [];
let geoJsonOutput = [];
let jsonObj = {};
const RESOLUTION = 7;

addLine = function(line, resolution = RESOLUTION){

    if(csvOutput == '') 
        csvOutput += 'lat,lng,value\n'

    const lngLat = proj4(projections['ETRS89'], projections['wgs84'], [parseInt(line.etrs_x),parseInt(line.etrs_y)]);

    const longitude = lngLat[0];
    const latitude = lngLat[1];

    const hex = h3.geoToH3(latitude, longitude, resolution);

    const surveyPoint = [
        latitude,
        longitude,
        parseFloat(line.Terminalv_zz__ob_1_3_zz_Altv_Proz)
    ]
    csvOutput += surveyPoint.join(',') + '\n'

    jsonOutput.push({
        x: latitude,
        y: longitude,
        val: parseFloat(line.Terminalv_zz__ob_1_3_zz_Altv_Proz),
        hex:hex
    })

    geoJsonOutput.push({
        type:"Feature",
        geometry:{
            type:"Polygon",
            coordinates: [h3.h3ToGeoBoundary(hex)],
        },
        properties: {
            proz: line.Terminalv_zz__ob_1_3_zz_Altv_Proz,
        }
    })


    if(typeof jsonObj[hex] == "undefined") {
        jsonObj[hex] = {
            coordinates: [h3.h3ToGeoBoundary(hex, true)],
            percent: [],
            count:0
        }
    }
    jsonObj[hex].percent.push(parseInt(line.Terminalv_zz__ob_1_3_zz_Altv_Proz))
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

writeFile = function(data){
    fs.writeFile('tmp/survey-data/h3_data_' + RESOLUTION +'.csv', data, function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '_' + RESOLUTION + '.csv');
    });
    fs.writeFile('tmp/survey-data/' + fileName + '_' + RESOLUTION + '.json', JSON.stringify(jsonOutput), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '_' + RESOLUTION + '.json');
    });
    fs.writeFile('tmp/survey-data/' + fileName + '_' + RESOLUTION + '_geo.json', JSON.stringify(avgObj(jsonObj, true)), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '_' + RESOLUTION + '_geo.json');
    });

    fs.writeFile('tmp/survey-data/' + fileName + '_' + RESOLUTION + '_min.json', JSON.stringify(avgObj(jsonObj, false)), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '_' + RESOLUTION + '_min.json');
    });
}



fs.createReadStream(filePath + fileName + '.csv')
    .pipe(csv({
      separator: ';'
    }))
    .on('data', (row) => {
        addLine(row, RESOLUTION);
    })
    .on('end', () => {
        writeFile(csvOutput)
});