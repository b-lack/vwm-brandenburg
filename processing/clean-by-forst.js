/*
    Gets all Files in Dir: OBFFOLDER
    Cleans Data by h3_on_forest_8.json
    Saves to CLEAROBFFOLDER
    node processing/clean-by-forst.js --outputDir reviere --resolution 9
    node processing/clean-by-forst.js --outputDir reviere --resolution 10
*/

const fs = require('fs');
const fsP = require('fs').promises;

var argv = require('minimist')(process.argv.slice(2));

let RESOLUTION;
let OBFFOLDER;
let CLEAROBFFOLDER;


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
    OBFFOLDER = 'processing/tmp/' + argv.outputDir + '/' + RESOLUTION + '/';
    CLEAROBFFOLDER = 'processing/tmp/' + argv.outputDir + '_clean/' + RESOLUTION + '/';
}

const h3_bb_data = fs.readFileSync('processing/tmp/bb/h3_on_forest_' +RESOLUTION+ '.json');
const h3_on_forest_array = JSON.parse(h3_bb_data);

if (fs.existsSync(CLEAROBFFOLDER)){
    //fs.rmdirSync(CLEAROBFFOLDER, { recursive: true });
}
if (!fs.existsSync(CLEAROBFFOLDER)){
    fs.mkdirSync(CLEAROBFFOLDER, { recursive: true });
}

function readFiles(folder, fileName){
    const forestdata = fs.readFileSync(folder + '/' + fileName);
    return JSON.parse(forestdata);
}

async function saveJsonToDist(nameToSave, dataStr){
    
    /*return fs.writeFile(nameToSave, 'Sdf', function (err) {
        if (err) return console.log(err);
        console.log('written file:',  nameToSave);
    });*/
    fs.writeFileSync(nameToSave, dataStr, function (err) {
        if (err) return console.log(err);
        console.log('written file:',  nameToSave);
    });
    //fsP.writeFile(CLEAROBFFOLDER + 'ddddd.json', dataStr);
    //return fsP.writeFile(nameToSave, 'fff');
    //return fsP.writeFile(nameToSave, dataStr);
}

async function paseFile(file){
        var data = readFiles(OBFFOLDER, file);
        
        if(data.hexagons){
            var filteredH3 = [];
            for(var i of data.hexagons){
                if(h3_on_forest_array.includes(i)){
                    filteredH3.push(i);
                }
            }
            var pre = data.hexagons.length;
            data.hexagons = filteredH3;
            
            if(data.hexagons.length > 0){
                console.log(file, pre, ' -> ', data.hexagons.length);
                saveJsonToDist(CLEAROBFFOLDER + file, JSON.stringify(data));
                /*fs.writeFile(CLEAROBFFOLDER + file, 'Sdf', function (err) {
                    if (err) return console.log(err);
                    console.log('written file:',  CLEAROBFFOLDER + file);
                });
                //fsP.writeFile(CLEAROBFFOLDER + file, JSON.stringify(data));
                console.log('saved: ', CLEAROBFFOLDER + file, JSON.stringify(data));
                fsP.writeFile(CLEAROBFFOLDER + 'ddddd', 'eee');*/
            }
                
        }
}

async function walkDir(files){
    for (const file of files) {
        const contents = await paseFile(file);
    }
}

fs.readdir(OBFFOLDER, (err, files) => {
    walkDir(files)
});