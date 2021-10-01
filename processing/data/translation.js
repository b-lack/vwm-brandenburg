const csv = require('csv-parser');
const fs = require('fs');
const proj4 = require('proj4')
const h3 = require("h3-js");
const { parse } = require('path');


const projections = {
    wgs84: "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs",
    ETRS89: "+proj=utm +zone=33 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
};

const fileName = 'verbiss_ausw_fl_data_2021';
const filePath = '/Users/b-mac/sites/lfb/vwm-translation/raw-data/Auswertung/InputData/Inventurdaten/IVuS2021/'
let jsonOutput = [];

translateLine = function(line){


    const lngLat = proj4(projections['ETRS89'], projections['wgs84'], [parseInt(line.etrs_x),parseInt(line.etrs_y)]);

    const longitude = lngLat[0];
    const latitude = lngLat[1];

    const valObj = {
        aggregationId: latitude + '_' + longitude,
        x: latitude,
        y: longitude,
        //etrs_x: line.etrs_x,
        //etrs_y: line.etrs_y,
        species: line.baumart,
        val: line.Terminalv_zz__ob_1_3_zz_Altv_Proz == 'NULL' ? 0 : parseFloat(line.Terminalv_zz__ob_1_3_zz_Altv_Proz),
        treeCount: parseInt(line.Gesamtanzahl)
    };

    jsonOutput.push(valObj)

    if(typeof valObj === 'string')
        console.log('EROROR');
}

var groupBy = function(xs, key) {
    return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};
processData = function(){
    const result = [];

    console.log('Data Lines:', jsonOutput.length);

    const grouped = groupBy(jsonOutput, 'aggregationId');

    for( var plot in grouped){
        const sum = grouped[plot].reduce((a, b) => {
            return a + b.val;
        }, 0);

        const allSpecies = groupBy(grouped[plot], 'species');
        const treeSpeciesCount = {};
        const treeSpeciesPercent = {};
        for( var species in allSpecies){
            var sumTreeCount = allSpecies[species].reduce((a, b) => {
                return a + b.treeCount;
            }, 0);
            treeSpeciesCount[species] = sumTreeCount;

            const speciesSum = allSpecies[species].reduce((a, b) => {
                return a + b.val;
            }, 0);
            treeSpeciesPercent[species] = Math.round(speciesSum / allSpecies[species].length * 100) / 100;
            
        }
        
            

        result.push({
            //id: plot,
            val: sum / grouped[plot].length,
            speciesCount: treeSpeciesCount,
            speciesPercent: treeSpeciesPercent
        });
    }

    console.log(result[2].speciesCount); // soll: { '4': 4, '6': 21, '8': 10 }
    console.log(result[2].speciesCount); // soll: { '4': 4, '6': 21, '8': 10 }
    console.log(result[2].speciesPercent); // soll: { '4': 83.33, '6': 36.67, '8': 36.67 }

    return result;
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

writeFile = function(){
    
    fs.writeFileSync(__dirname + '/../tmp/survey-data/' + fileName + '.json', JSON.stringify(jsonOutput), function (err) {
        if (err) return console.log(err);
        console.log('written file: ' + fileName + '.json');
    });
    
}



fs.createReadStream(filePath + fileName + '.csv')
    .pipe(csv({
      separator: ';'
    }))
    .on('data', (row) => {
        translateLine(row);
    })
    .on('end', () => {
        processData()
        writeFile()
});