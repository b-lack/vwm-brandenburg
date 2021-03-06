/**
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 8 --outputDir=schaele
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 9 --outputDir=schaele
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 10 --outputDir=schaele
 * 
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 8 --outputDir=verbiss
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 9 --outputDir=verbiss
 * node processing/data/idw.mjs --year 2020 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 10 --outputDir=verbiss
 * 
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/vwm_gesamt.json --resolution 8 --outputDir=verbiss
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/vwm_gesamt.json --resolution 9 --outputDir=verbiss
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/vwm_gesamt.json --resolution 10 --outputDir=verbiss
 * 
*/

import fs from 'fs';
import * as h3 from 'h3-js'
import minimist from 'minimist'
import { URL } from 'url';
import pako from 'pako'

var argv = minimist(process.argv.slice(2));

let RESOLUTION;
let YEAR;
let DATAFILEPATH;
let OUTPUTDIR

if(typeof argv.outputDir === "undefined") {
    console.warn('"--outputDir" attribute missing');
    process.exit(1);
}else{
    OUTPUTDIR = argv.outputDir;
}
if(typeof argv.year === "undefined") {
    console.warn('"--YEAR" attribute missing');
    process.exit(1);
}else{
    YEAR = argv.year;
}
if(typeof argv.dataFilePath === "undefined") {
    console.warn('"--dataFilePath" attribute missing');
    process.exit(1);
}else{
    DATAFILEPATH = argv.dataFilePath;
}
if(typeof argv.resolution === "undefined") {
    console.warn('"--resolution" attribute missing');
    process.exit(1);
}else{
    RESOLUTION = argv.resolution;
}


const __dirname = new URL('./', import.meta.url).pathname;

const SURVEYDIRECTORY = __dirname + '../tmp/resolutions_clean/' + RESOLUTION + '/';
const OUTPUTDIRECTORY = __dirname + '../../docs/interpolation/' + YEAR + '/' + OUTPUTDIR + '/' + RESOLUTION + '/';

// TEMP
const add_values = fs.readFileSync(__dirname + '../tmp/survey-data/species/tree_species' + RESOLUTION + '.json');
const addValuesArr = JSON.parse(add_values);


if (!fs.existsSync(OUTPUTDIRECTORY)){
    fs.mkdirSync(OUTPUTDIRECTORY, { recursive: true });
}

//https://github.com/NicolaiMogensen/Inverse-Distance-Weighting-JS/blob/master/idwJS.js
function calcVal(v, points, p) {
    var top = 0; 
    var bot = 0;
    for (var i = 0; i < points.length; i++) {
        var dist = calcDist(v, points[i]);
        top += points[i].val / Math.pow(dist, p);
        bot += 1 / Math.pow(dist, p);
    }
    if (bot == 0) {
        return top;
    } else {
        return (top / bot);
    }
}

function calcDist(p, q) {
    return (Math.sqrt( Math.pow((q.x-p.x),2) + Math.pow((p.y-q.y),2)));
}


const survey_points = fs.readFileSync(DATAFILEPATH);
const surveyPointsObj = JSON.parse(survey_points);
const filesToChache = [];

let globalOutput = []

function parseFile(file){
    const toFillPoints = fs.readFileSync(SURVEYDIRECTORY + file);
    const toFillPointsObj = JSON.parse(toFillPoints);


    let output = []
    for(var i of toFillPointsObj.hexagons){
        const hexCenterCoordinates = h3.h3ToGeo(i);
        let searchFor = { 
            x: hexCenterCoordinates[0], 
            y: hexCenterCoordinates[1], 
            val: 0, 
            hex: i
        };
        searchFor.val = calcVal({ x: hexCenterCoordinates[0], y: hexCenterCoordinates[1]}, surveyPointsObj, 2);
        output.push({
            hex: i,
            val: Math.round(searchFor.val*100)/100,
            species: addValuesArr[i] ||??{}
        });
    }

    fs.writeFileSync(OUTPUTDIRECTORY + file + '.gzip', pako.deflate(JSON.stringify(output)), function (err) {
        if (err) return console.log(err);
        console.log('written file:',  OUTPUTDIRECTORY + file);
    });
    filesToChache.push('./interpolation/' + YEAR + '/' + OUTPUTDIR + '/' + RESOLUTION + '/' + file + '.gzip');
    
    fs.writeFileSync(OUTPUTDIRECTORY + 'fileToCache.json', JSON.stringify(filesToChache), function (err) {
        if (err) return console.log(err);
        console.log('written file:',  OUTPUTDIRECTORY + file);
    });
}

function walkDir(files){
    
    for (const file of files) {
        const contents = parseFile(file);
    }
}

fs.readdir(SURVEYDIRECTORY, (err, files) => {
    walkDir(files)
});