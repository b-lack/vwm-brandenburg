const fs = require('fs');
const fsP = require('fs').promises;

const h3_bb_data = fs.readFileSync('/Users/b-mac/sites/lfb/vwm-brandenburg/processing/tmp/bb/h3_on_forest_8.json');
const h3_on_forest_array = JSON.parse(h3_bb_data);

const CLEAROBFFOLDER = __dirname +'/tmp/obf_clean/';
const OBFFOLDER = __dirname +'/tmp/obf';

if (fs.existsSync(CLEAROBFFOLDER)){
    fs.rmdirSync(CLEAROBFFOLDER, { recursive: true });
}
if (!fs.existsSync(CLEAROBFFOLDER)){
    fs.mkdirSync(CLEAROBFFOLDER, { recursive: true });
}

function readFiles(folder, fileName){
    const forestdata = fs.readFileSync(folder + '/' + fileName);
    return JSON.parse(forestdata);
}


fs.readdir(OBFFOLDER, (err, files) => {

    

    files.forEach(file => {
        
       var data = readFiles(OBFFOLDER, file);
       var filteredH3 = [];
       if(data.hexagons){
            for(var i of data.hexagons){
                if(h3_on_forest_array.includes(i)){
                    filteredH3.push(i);
                }
            }
            var pre = data.hexagons.length;
            data.hexagons = filteredH3;
            console.log(file, pre, ' -> ', data.hexagons.length);
            if(data.hexagons.length > 0)
                fsP.writeFile(CLEAROBFFOLDER + file, JSON.stringify(data));
       }
    });
});
