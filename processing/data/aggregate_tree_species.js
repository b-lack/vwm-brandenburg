/**
 *  node processing/data/aggregate_tree_species.js
 */
 const csv = require('csv-parser');
 const fs = require('fs');
 const h3 = require("h3-js");

FILENAME = '/Users/b-mac/sites/lfb/vwm-translation/raw-data/VWM/vwm_verb_ba20211009.csv'
RESOLUTION = 8

const jsonObj = {};
const jsonOutput = {};

function parseLine(line){
    const h3Index = h3.geoToH3(line.LATITUDE, line.LONGITUDE, RESOLUTION);
    
    if(!jsonObj[h3Index]) jsonObj[h3Index] = {
        treeCountInHex: parseInt(line['n BA'])
    }
    else
        jsonObj[h3Index]['treeCountInHex']+=parseInt(line['n BA']);

    if(!jsonObj[h3Index][line['kurzd']]){
        jsonObj[h3Index][line['kurzd']] = {
            //line:[line],
            //verbissPercent: parseFloat(line['verbissen%']),
            //speciesPercent: parseFloat(line['BA%']),
            speciesCount: parseInt(line['n BA']),
            //transectCount: 0
        }
    }else{
        //jsonObj[h3Index][line['kurzd']]['verbissPercent'] = (jsonObj[h3Index][line['kurzd']]['verbissPercent'] + parseFloat(line['verbissen%'])) / 2
        //jsonObj[h3Index][line['kurzd']]['speciesPercent'] = (jsonObj[h3Index][line['kurzd']]['speciesPercent'] + parseFloat(line['BA%'])) / 2
        jsonObj[h3Index][line['kurzd']]['speciesCount'] += parseInt(line['n BA']);
        //jsonObj[h3Index][line['kurzd']]['transectCount']++
        //jsonObj[h3Index][line['kurzd']]['line'].push(line);
    };
}

function agr(){
    const obj = {};
    for(var i in jsonObj){
        let ctl = 0;
        const count = jsonObj[i]['treeCountInHex'];
        
        obj[i] = {
            data:[],
            label: []
        };
        for(var j in jsonObj[i]){
            if(j!=='treeCountInHex'){
                obj[i].label.push(j);
                const rounded = Math.round(jsonObj[i][j]['speciesCount']/count*100);
                obj[i].data.push(rounded);
                ctl += rounded;
            }
        }
        if(ctl!=100)
            console.log('ALARM NOT 100:', ctl);
    }
    return obj
}

fs.createReadStream(FILENAME)
.pipe(csv({
  separator: ';'
}))
.on('data', (row) => {
    parseLine(row);
})
.on('end', () => {
    fs.writeFileSync(__dirname + '/../tmp/survey-data/species/tree_species' + RESOLUTION + '.json', JSON.stringify(agr(jsonOutput)), function (err) {
        if (err) return console.log(err);
        console.log('written file: tree_species.json');
    });
});