//import Map from '../map/map'
//import APP from '../react-map/map'
import React, {useState, useCallback} from 'react';
import ReactApp from '../deckgl/react'

import ReactDOM from 'react-dom';

import Map from '../deckgl/map'
import * as obfObfDd from '../../geo-resolution/obf.json';
import * as obfRevierDd from '../../geo-resolution/reviere.json';

class VWM{
    constructor(dataObj = {}) {
        //this.dataPath = dataPath;
        this.selectedObf = null;
        this.selectedRevier = null;
        this.dataObj = dataObj
        //this.map = new Map();
        this.views = {}
        this.currentView = null
        this.dataValid = {geoData: false, data: true};
        this.currentLayerKey = null;
        this.currentViewKey = '';

        this.selectedYear = '2021';
        this.selectedLayer = 'ivus_verbiss';
        this.selectedResolution = 8;
        this.areaId = null;
        this.is3D = false;

        this.currentArea = {
            8: 'undefined',
            9: null,
            10: null
        };
        
    }
    toOverview(dataObj){
        this.dataObj = dataObj || this.dataObj;
        if(!this.dataObj.polygons){
            console.error('polygons attribute is not defined');
        }
        
        if(this.dataObj.mask){
            this.getMaskLayer(this.dataObj.mask, 0, 8);
        }
        this.selectedResolution = 8;
        this.currentArea[this.selectedResolution] = 'undefined';
        this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' +this.selectedResolution+ '/fid_' + this.currentArea[this.selectedResolution] + '_' +this.selectedResolution+ '.json', 'global', this.selectedResolution);
        
    }
    changeYear(newValue){
        if(this.selectedYear==newYear) return;
        this.selectedYear = newValue;
    }
    changeLayer(newLayer){
        if(this.selectedLayer==newLayer) return;
        
        this.selectedLayer = newLayer;
        this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' +this.selectedResolution+ '/fid_' + this.currentArea[this.selectedResolution] + '_' +this.selectedResolution+ '.json', 'global', this.selectedResolution);

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
            //this.map.addObf(outlines, this.focusObf.bind(this));
        });
    }
    getMaskLayer(url, id, resolution){
        this._loadJson(url).then(outlines => {
            //this.map.addMask(outlines); //.features[0].geometry.coordinates[0][0]
            if(resolution==8)
                this.maskLayer = outlines.features[0];
            else{
                this.focus = this.childMaskLayer !== outlines.features[0];
                this.childMaskLayer = outlines.features[0];
            }
                
            this.refreshReact();
            //this.map.addMask('mask-layer-', outlines.features[0], id, resolution); //preId, data, featureId, resolution
        });
    }
    getH3Layer(url, featureId, resolution){
        this._loadJson(url).then(outlines => {
            this.h3Layer = outlines;
            this.refreshReact();
            //this.map.addPolygonsByH3('h3-hexagon-layer-', outlines, featureId, resolution, this.selectedLayer, this.selectedYear, true);
        }).catch(e => {
            console.log(e);
        });
    }
    
    changeView(e){
        if(this.is3D !==e.viewState.pitch>0){
            this.is3D = e.viewState.pitch>0
            this.refreshReact();
        }
    }
    refreshReact(){
        var that = this;
        
        ReactDOM.render(
            <ReactApp data={this.h3Layer} maskData={this.maskLayer} childMaskData={this.childMaskLayer} parent={function(e){
                that.changeView(e)
            }} show3D={this.is3D} resolution={this.selectedResolution}/>,
            document.getElementById('react-gl')
        );
    }
    addView(name, view){
        this.views[name] = view;
    }
    focusLand(featureId, loadChild){
        if(featureId == 0){
            this.selectedResolution = 8;
        }else{
            this.selectedResolution = 9;
            this.currentArea[9] = featureId;
            this.areaId = featureId;
        }
        /*if(loadChild)
            this.addJsonLayer('./geo/obf/' + featureId + '.geojson');*/
            
        this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' + this.selectedResolution + '/fid_' + this.currentArea[this.selectedResolution] +'_' + this.selectedResolution + '.json', this.currentArea[this.selectedResolution], this.selectedResolution); // layer[0].h3
        if(this.selectedResolution == 9)
            this.getMaskLayer('./geo/obf/' + this.currentArea[this.selectedResolution] +'.geojson', this.currentArea[this.selectedResolution], this.selectedResolution);
        //this.setView(featureId, null);
    }
    focusObf(featureId, loadChild){console.log(featureId);
        if(featureId == 0){
            this.selectedResolution = 9;
            var dir = 'obf';
        }else{
            this.selectedResolution = 10;
            this.currentArea[10] = featureId
            this.areaId = featureId;
            var dir = 'reviere';
        }
        //if(loadChild)
        //this.addJsonLayer('../processing/tmp/reviere/' + featureId + '.geojson'); // layer[0].polygons
        
        this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' + this.selectedResolution + '/fid_' + this.currentArea[this.selectedResolution] +'_' + this.selectedResolution + '.json', this.currentArea[this.selectedResolution], this.selectedResolution); // layer[0].h3
        this.getMaskLayer('./geo/' + dir + '/' + this.currentArea[this.selectedResolution] +'.geojson', this.currentArea[this.selectedResolution], this.selectedResolution);
        //this.setView(this.selectedObf, featureId);
    }
    /*setView(selectedObf = null, selectedRevier = null){
        this.selectedObf = selectedObf
        this.selectedRevier = selectedRevier;
        this.updateNavigation()
    }
    updateNavigation(){
        document.getElementById('selectedObf').innerText = this.selectedObf || '';
        document.getElementById('selectedRevier').innerText = this.selectedRevier || '';
    }*/
    addMap(elementId){
        //this.map.init(elementId);
        this.toOverview();
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