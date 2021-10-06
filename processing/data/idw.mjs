/**
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 8
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 9
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_schaele.json --resolution 10
 * 
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 8
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 9
 * node processing/data/idw.mjs --year 2021 --dataFilePath /Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/survey-data/ivus_verbiss.json --resolution 10
 * 
*/

import * as turf from '@turf/turf'
import fs from 'fs';
import * as h3 from 'h3-js'
import minimist from 'minimist'
import { URL } from 'url';
import path from 'path'

var argv = minimist(process.argv.slice(2));

let RESOLUTION;
let YEAR;
let DATAFILEPATH;

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

var dataFileName = path.basename(DATAFILEPATH).split('.')[0];

const SURVEYDIRECTORY = __dirname + '../tmp/resolutions_clean/' + RESOLUTION + '/';
const OUTPUTDIRECTORY = __dirname + '../tmp/interpolation/' + YEAR + '/' + dataFileName + '/' + RESOLUTION + '/';



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
    if (bot == 0) { //When the distance between point and sensor is 0 (the point IS the sensor) Gives black spots, so fix this   
        return top;
    } else {
        return (top / bot);
    }
}

function calcDist(p, q) {
    return (Math.sqrt( Math.pow((q.x-p.x),2) + Math.pow((p.y-q.y),2)));
}


// load meassured data
const survey_points = fs.readFileSync(DATAFILEPATH);
const surveyPointsObj = JSON.parse(survey_points);



function parseFile(file){
    // load h3 grid to fill
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
            val: searchFor.val
        });
    }
    fs.writeFileSync(OUTPUTDIRECTORY + file, JSON.stringify(output), function (err) {
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