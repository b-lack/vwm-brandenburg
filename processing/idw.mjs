import * as turf from '@turf/turf'
import fs from 'fs';
import * as h3 from 'h3-js'

//https://github.com/NicolaiMogensen/Inverse-Distance-Weighting-JS/blob/master/idwJS.js

//const SURVEYDIRECTORY = 'tmp/reviere_clean/10/';
const SURVEYDIRECTORY = 'tmp/obf_clean/8/';
const OUTPUTDIRECTORY = 'tmp/interpolation/8/';

if (!fs.existsSync(OUTPUTDIRECTORY)){
    fs.mkdirSync(OUTPUTDIRECTORY, { recursive: true });
}

function calcVal(v, points,p) {
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
const survey_points = fs.readFileSync('tmp/survey-data/verbiss_ausw_fl_ba_2020_7.json');
const surveyPointsObj = JSON.parse(survey_points);



function parseFile(file){
    // load h3 grid to fill
    const toFillPoints = fs.readFileSync(SURVEYDIRECTORY + file);
    const toFillPointsObj = JSON.parse(toFillPoints);


    let output = []
    for(var i of toFillPointsObj.hexagons){
        const hexCenterCoordinates = h3.h3ToGeo(i);
        let searchFor = { x: hexCenterCoordinates[0], y: hexCenterCoordinates[1], val: 0, hex: i };
        searchFor.val = calcVal({ x: hexCenterCoordinates[0], y: hexCenterCoordinates[1], val: 0 }, surveyPointsObj, 2);
        output.push(searchFor);
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