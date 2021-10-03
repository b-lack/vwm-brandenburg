//import Map from '../map/map'
//import APP from '../react-map/map'

import Map from '../deckgl/map'
import * as obfObfDd from '../../geo-resolution/obf.json';
import * as obfRevierDd from '../../geo-resolution/reviere.json';

class VWM{
    constructor(dataObj = {}) {
        //this.dataPath = dataPath;
        this.selectedObf = null;
        this.selectedRevier = null;
        this.dataObj = dataObj
        this.map = new Map();
        this.views = {}
        this.currentView = null
        this.dataValid = {geoData: false, data: true};
        this.currentLayerKey = null;
        this.currentViewKey = '';
        
        this.toOverview();
    }
    toOverview(dataObj){
        this.dataObj = dataObj || this.dataObj;
        if(!this.dataObj.polygons){
            console.error('polygons attribute is not defined');
        }
        
        //this.addJsonLayer(this.dataObj.polygons);
        this._loadJson(this.dataObj.polygons).then(outlines => {
            this.map.addParent(outlines, this.focusLand.bind(this));
        });

        if(this.dataObj.mask){
            this.getMaskLayer(this.dataObj.mask, 0, 8);
        }
    }
    createObfDropdown(elementId, childId){
        const that = this;
        const selectElement = document.createElement('SELECT');
        let optionElement = document.createElement('OPTION');
        optionElement.innerText = 'wählen ...';
        optionElement.setAttribute("value", 0);
        selectElement.append(optionElement);

        for(var i = 0; i < obfObfDd.default.length; i++){
            let optionElement = document.createElement('OPTION');
            optionElement.innerText = obfObfDd.default[i].name;
            optionElement.setAttribute("value", obfObfDd.default[i].id);
            selectElement.append(optionElement);
        }

        document.getElementById(elementId).append(selectElement);
        selectElement.addEventListener('change', (e) => {
            const newValue = e.target.options[e.target.selectedIndex].value;
            if(newValue === 0) return;

            that.focusLand(newValue);
            var selected = obfObfDd.default.filter(elem => {
                return elem.id === parseInt(newValue);
            });
            if(selected.length!==0)
                that.createRevierDropdown(childId, parseInt(selected[0].obf));
        })
    }
    createRevierDropdown(elementId, parentId){

        const filteredByParent = obfRevierDd.default.filter(elem => elem.obf === parentId)

        const that = this;
        const selectElement = document.createElement('SELECT');
        let optionElement = document.createElement('OPTION');
        optionElement.innerText = 'wählen ...';
        optionElement.setAttribute("value", 0);
        selectElement.append(optionElement);

        for(var i = 0; i < filteredByParent.length; i++){
            let optionElement = document.createElement('OPTION');
            optionElement.innerText = filteredByParent[i].name;
            optionElement.setAttribute("value", filteredByParent[i].id);
            selectElement.append(optionElement);
        }

        document.getElementById(elementId).innerHTML = '';
        document.getElementById(elementId).append(selectElement);
        selectElement.addEventListener('change', (e) => {
            var newValue = e.target.options[e.target.selectedIndex].value;
            if(newValue === 0) return;
            
            that.focusObf(newValue);
        })
    }
    addJsonLayer(url){
        this._loadJson(url).then(outlines => {
            this.map.addObf(outlines, this.focusObf.bind(this));
        });
    }
    getMaskLayer(url, id, resolution){
        this._loadJson(url).then(outlines => {
            //this.map.addMask(outlines); //.features[0].geometry.coordinates[0][0]
            this.map.addMask('mask-layer-', outlines.features[0], id, resolution); //preId, data, featureId, resolution
        });
    }
    getH3Layer(url, featureId, resolution){
        this._loadJson(url).then(outlines => {
            this.map.addPolygonsByH3('h3-hexagon-layer-', outlines, featureId, resolution);
        }).catch(e => {
            console.log(e);
        });
    }
    addView(name, view){
        this.views[name] = view;
    }
    focusLand(featureId, loadChild){console.log('focusLand')
        /*if(loadChild)
            this.addJsonLayer('./geo/obf/' + featureId + '.geojson');*/
        this.getH3Layer('./interpolation/9/fid_' + featureId +'_9.json', featureId, 9); // layer[0].h3
        this.getMaskLayer('./geo/obf/' + featureId +'.geojson', featureId, 9);
        //this.setView(featureId, null);
    }
    focusObf(featureId, loadChild){console.log('focusObf')
        //if(loadChild)
        //this.addJsonLayer('../processing/tmp/reviere/' + featureId + '.geojson'); // layer[0].polygons
        this.getH3Layer('./interpolation/10/fid_' + featureId +'_10.json', featureId, 10); // layer[0].h3
        this.getMaskLayer('./geo/reviere/' + featureId +'.geojson', featureId, 10);
        //this.setView(this.selectedObf, featureId);
    }
    setView(selectedObf = null, selectedRevier = null){
        this.selectedObf = selectedObf
        this.selectedRevier = selectedRevier;
        this.updateNavigation()
    }
    updateNavigation(){
        console.log(this.selectedObf);
        document.getElementById('selectedObf').innerText = this.selectedObf || '';
        document.getElementById('selectedRevier').innerText = this.selectedRevier || '';
    }
    
    /*changeView(name){
        if(!this.views[name] || this.currentViewKey === name) return false;

        let newView = this.views[name];
        if(newView.jsonOutlines){
            this.currentViewKey = name;
            this.addMask();
        }else
            this._loadJson(newView.outlines).then(outlines => {
                this.currentViewKey = name;
                newView.jsonOutlines = outlines;
                this.changeLayer(0);
                this.addMask();
            });
    }*/
    /*changeLayer(layerKey){
        if(!this.views[this.currentViewKey].dataLayer[layerKey] || this.currentLayerKey === layerKey) return false;
        
        this.dataValid.data = false;

        let newView = this.views[this.currentViewKey];
        if(newView.dataLayer[layerKey].jsonData){
            this.currentLayerKey = layerKey;
            this.addDataLayer();
        }else
            this._loadJson(newView.dataLayer[layerKey].path).then(data => {
                
                //this.dataValid.data = true;
                this.currentLayerKey = layerKey;
                
                newView.dataLayer[layerKey].jsonData = data;

                this.addDataLayer();
                //this.refreshWidgets(newView);
            });
    }
    addDataLayer(){
        this.map.addPolygonsByH3(this.views[this.currentViewKey].dataLayer[this.currentLayerKey].jsonData, this.views[this.currentViewKey].dataLayer[this.currentLayerKey].color);
    }*/
    /*checkDataValid(view){
        if(this.dataValid.data && this.dataValid.geoData){
            this.currentView = view;
            this.refreshWidgets();
        }
    }*/
    
    /*refreshData(dataPath = '../data/bb_7_geo.json'){
        this._loadJson(this.dataPath).then(data => {
            this.data = data;
            this.dataPath = dataPath;
            this.refreshWidgets(true, false);
        });
    }
    refreshGeoData(geoDataPath = '../data/land_small.json'){
        this._loadJson(this.geoDataPath).then(data => {
            this.data = data;
            this.geoDataPath = geoDataPath;
            this.refreshWidgets(false, true);
        });
    }*/
    /*refreshWidgets(){
        if(!this.currentView) return false;

        this.addMask();
        this.map.addPolygonsByH3(this.currentView.jsonData);
    }
    addMask(polygon){
        if(this.views[this.currentViewKey]){
            //this.map.addMask(polygon);
            this.map.createMaskLayer(polygon);
            //this.map.addMask(this.views[this.currentViewKey].jsonOutlines.features[0].geometry.coordinates[0][0]);
        }
           
    }*/
    removeMask(){
        return this.map.removeMask();
    }
    addMap(elementId, basemap){
        
        this.map.init(elementId, basemap);
        
        return this.map;
    }
    addBasemap(){
        const that = this;
        //this.map.createBaseMap();
        /*this.getH3Layer('./interpolation/8/1_8.json');
        setTimeout(function(){
            that.getH3Layer('./interpolation/8/3_8.json');
        }, 2000)*/
        this.getH3Layer('./interpolation/8/fid_undefined_8.json', 'global', 8);
        /*for(var i=1; i<31; i++){
            this.getH3Layer('./interpolation/8/'+i+'_8.json');
        }*/
    }
    async _loadJson(url){
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            //cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            //credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }
}

export default VWM;