//import Map from '../map/map'
//import APP from '../react-map/map'
import React, {useState, useCallback} from 'react';
import ReactApp from '../deckgl/react'

import ReactDOM from 'react-dom';

//import Map from '../deckgl/map'
import * as obfObfDd from '../../geo-resolution/obf.json';
import * as obfRevierDd from '../../geo-resolution/reviere.json';

class VWM{
    constructor() {

        this.selectedObf = null;
        this.selectedRevier = null;
        this.views = {}
        this.currentView = null
        this.dataValid = {geoData: false, data: true};
        this.currentLayerKey = null;
        this.currentViewKey = '';

        this.selectedYear = '2021';
        this.selectedLayer = null;
        this.selectedResolution = 8;
        this.is3D = false;

        this.currentArea = {
            8: 'undefined',
            9: null,
            10: null
        };

        //const validHash = this.getHash();
        //this.toOverview(validHash);
        this.getHash();
    }
    toOverview(validHash){

        this.selectedResolution = 8;
        
        //this.updateNavigation();

        //this.getMaskLayer('./geo/land.geojson', 0, this.selectedResolution);

        //if(validHash) return;
        
        //this.currentArea[this.selectedResolution] = 'undefined';

        
        //this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' +this.selectedResolution+ '/fid_' + this.currentArea[this.selectedResolution] + '_' +this.selectedResolution+ '.json', 'global', this.selectedResolution);

    }
    getHash(){
        if(window.location.hash) {
            var hash = window.location.hash.substring(1).split(',');
            if(hash[0] && parseInt(hash[0])){
                this.currentArea[9] = parseInt(hash[0]);
            }else{
                return false;
            }
            if(hash[1] && parseInt(hash[1])){
                this.currentArea[10] = parseInt(hash[1]);
                this.focusObf(this.currentArea[10]);
            }else{
                this.focusLand(this.currentArea[9]);
            }
            return true;
        }
        return false;
    }
    setHash(){
        if(this.currentArea[10])
            window.location.hash = '#' + this.currentArea[9] + ',' + this.currentArea[10]
        else if(this.currentArea[9])
            window.location.hash = '#' + this.currentArea[9]
        else
            window.location.hash = ''
    }
    changeYear(newValue){
        if(this.selectedYear==newYear) return;
        this.selectedYear = newValue;
    }
    changeLayer(newLayer){
        if(this.selectedLayer==newLayer) return;
        
        this.selectedLayer = newLayer;

        this.updateNavigation();
        //this.getH3Layer();
        //this.getH3Layer('./interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' +this.selectedResolution+ '/fid_' + this.currentArea[this.selectedResolution] + '_' +this.selectedResolution+ '.json', 'global', this.selectedResolution);

    }
    updateDropDowns(){
        if(this.obfDropDown){
            this.obfDropDown.value = this.currentArea[9] ? this.currentArea[9] : 0;
        }
        if(this.revierDropDown){
            this.revierDropDown.value = this.currentArea[10] ? this.currentArea[10] : 0;
        }
    }
    createObfDropdown(elementId, childId){
        const that = this;
        this.obfDropDown = document.createElement('SELECT');
        let optionElement = document.createElement('OPTION');
        optionElement.innerText = 'Oberförsterei';
        optionElement.setAttribute("value", 0);
        this.obfDropDown.append(optionElement);

        for(var i = 0; i < obfObfDd.default.length; i++){
            let optionElement = document.createElement('OPTION');
            optionElement.innerText = obfObfDd.default[i].name;
            optionElement.setAttribute("value", obfObfDd.default[i].id);
            this.obfDropDown.append(optionElement);
        }

        document.getElementById(elementId).append(this.obfDropDown);
        this.obfDropDown.addEventListener('change', (e) => {
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
        this.revierDropDown = document.createElement('SELECT');
        let optionElement = document.createElement('OPTION');
        optionElement.innerText = 'Revier';
        optionElement.setAttribute("value", 0);
        this.revierDropDown.append(optionElement);

        for(var i = 0; i < filteredByParent.length; i++){
            let optionElement = document.createElement('OPTION');
            optionElement.innerText = filteredByParent[i].name;
            optionElement.setAttribute("value", filteredByParent[i].id);
            this.revierDropDown.append(optionElement);
        }

        document.getElementById(elementId).innerHTML = '';
        document.getElementById(elementId).append(this.revierDropDown);
        this.revierDropDown.addEventListener('change', (e) => {
            var newValue = e.target.options[e.target.selectedIndex].value;
            if(newValue === 0) return;
            
            that.focusObf(newValue);
        })
    }
    createAreaInfo(elementId){
        this.infoElementId = elementId;
        this.updateAreaInfo();
    }
    updateAreaInfo(){
        let filteredObfArea = [], filteredRevierArea = [];

        if(!this.infoElementId) return

        document.getElementById(this.infoElementId).innerHTML = '';

        if(this.currentArea[10]){
            filteredRevierArea = obfRevierDd.default.filter(elem => elem.id == this.currentArea[10])
        }
        if(this.currentArea[9]){
            filteredObfArea = obfObfDd.default.filter(elem => {
                return elem.id == parseInt(this.currentArea[9])
            })
        }

        const infoWindow = document.createElement('DIV');
        infoWindow.classList.add('ge-info-window');

        if(filteredObfArea.length > 0){
    
            let infoLine = document.createElement('DIV');
            infoLine.classList.add('ge-row', 'ge-selection');
            let obfName = document.createElement('DIV');
            obfName.innerText = filteredObfArea[0].name;
            infoLine.append(obfName);
            let obfClose = document.createElement('DIV');
            obfClose.innerHTML = '&#x2715;';
            obfClose.addEventListener('click', () => obj.removeLayer('9'));
            infoLine.append(obfClose);

            infoWindow.append(infoLine);
        }

        if(filteredRevierArea.length > 0){

            let infoLine = document.createElement('DIV');
            infoLine.classList.add('ge-row', 'ge-selection');
            let obfName = document.createElement('DIV');
            obfName.innerText = filteredRevierArea[0].name;
            infoLine.append(obfName);
            let obfClose = document.createElement('DIV');
            obfClose.innerHTML = '&#x2715;';
            obfClose.addEventListener('click', () => obj.removeLayer('10'));
            infoLine.append(obfClose);
            
            infoWindow.append(infoLine);
        }
        
        if(filteredObfArea.length ==0){
            const subHeader = document.createElement('DIV');
            subHeader.classList.add('ge-subheader');
            subHeader.innerText = 'Wähle eine Oberförsterei';
            infoWindow.append(subHeader);
        }else{
            const subHeader = document.createElement('DIV');
            subHeader.classList.add('ge-subheader');
            subHeader.innerText = 'Wähle ein Revier';
            infoWindow.append(subHeader);
        };

        document.getElementById(this.infoElementId).append(infoWindow);
    }
    removeLayer(resolution){
        if(resolution && this.currentArea[resolution]){
            this.currentArea[resolution] = null;
            this.selectedResolution = resolution-1;
            this.updateNavigation();
        }
    }
    updateNavigation(){
        this.updateAreaList();
        this.updateAreaInfo();
        this.updateList();
        this.updateRevierList();
        this.updateDropDowns();
        this.setHash();

        if(this.currentArea[10]){
            document.body.classList.add('ge-res-10');
            document.body.classList.remove('ge-res-9', 'ge-res-8');
        }else if(this.currentArea[9]){
            document.body.classList.add('ge-res-9');
            document.body.classList.remove('ge-res-10', 'ge-res-8');
        }else{
            document.body.classList.add('ge-res-8');
            document.body.classList.remove('ge-res-10', 'ge-res-9');
        }


        this.getH3Layer();
        if(this.selectedResolution !== 8)
            this.getMaskLayer('./geo/' + (this.selectedResolution == 9 ? 'obf' : 'reviere') + '/' + this.currentArea[this.selectedResolution] +'.geojson', this.currentArea[this.selectedResolution], this.selectedResolution);
        else
            this.getMaskLayer('./geo/land.geojson', 0, this.selectedResolution);
    }
    checkMobileNavigation(){
        document.getElementById('ge-mobile-navigation')
    }
    createAreaList(elementId){
        this.areaList = elementId;
        
        this.updateAreaList();
    }
    updateAreaList(){
        if(!this.areaList) return;

        document.getElementById(this.areaList).innerHTML = '';

        if(this.currentArea[9]){
            document.getElementById(this.areaList).append(this.getReviereList(this.currentArea[9]));
        } else if(this.currentArea[8]){
            document.getElementById(this.areaList).append(this.getObfList());
        }
        
           
    }
    getObfList(){
        const that = this;
        this.oBfListElementId = 'ge-area-list-Obf';

        var data = obfObfDd.default.sort((a, b) => {
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0
        })

        let listWrapper = document.createElement('DIV');
        listWrapper.classList.add('ge-area-list');
        listWrapper.setAttribute('id', this.listElementId)

        for(var i = 0; i < data.length; i++){

            let lineElement = document.createElement('DIV');
            lineElement.setAttribute('data-id', data[i].id)
            lineElement.setAttribute('data-obf', data[i].obf)
            lineElement.addEventListener('click', (e) => that.focusLand(e.target.getAttribute('data-id')))
            lineElement.innerText = data[i].name;

            listWrapper.append(lineElement);
        }
        return listWrapper;
    }
    getReviereList(parentId){
        const that = this;
        this.revierListElementId = 'ge-area-list-Revier';

        const filteredObf = obfObfDd.default.filter(elem => parseInt(elem.id) === parseInt(parentId))

        if(filteredObf.length < 1) return;

        const filteredByParent = obfRevierDd.default.filter(elem => parseInt(elem.obf) === parseInt(filteredObf[0].obf))

        if(filteredByParent.length < 1) return;

        var data = filteredByParent.sort((a, b) => {
            if(a.name < b.name) return -1;
            if(a.name > b.name) return 1;
            return 0
        })

        let listWrapper = document.createElement('DIV');
        listWrapper.classList.add('ge-area-list');
        listWrapper.setAttribute('id', this.revierListElementId)

        for(var i = 0; i < data.length; i++){

            let lineElement = document.createElement('DIV');
            lineElement.setAttribute('data-id', data[i].id)
            lineElement.addEventListener('click', (e) => that.focusObf(e.target.getAttribute('data-id')))
            lineElement.innerText = data[i].name;

            listWrapper.append(lineElement);
        }
        return listWrapper;
    }
    updateList(){
        if(!this.oBfListElementId) return;
        const wrapper = document.getElementById(this.oBfListElementId);

        if (!wrapper || !wrapper.hasChildNodes()) return 

        const children = document.getElementById(this.oBfListElementId).childNodes;
        
        for(var i = 0; i < children.length; i++) {
            const attribute = children[i].getAttribute('data-id');
            if(attribute && attribute == this.currentArea[9]){
                children[i].classList.add('active');
            }else{
                children[i].classList.remove('active');
            }
        }
    }
    updateRevierList(){
        
        if(!this.revierListElementId) return;
        const wrapper = document.getElementById(this.revierListElementId);

        if (!wrapper || !wrapper.hasChildNodes()) return 

        const children = document.getElementById(this.revierListElementId).childNodes;
        
        for(var i = 0; i < children.length; i++) {
            const attribute = children[i].getAttribute('data-id');
            if(attribute && attribute == this.currentArea[10]){
                children[i].classList.add('active');
            }else{
                children[i].classList.remove('active');
            }
        }
    }
    getMaskLayer(url, id, resolution){
        this._loadJson(url).then(outlines => {
            if(resolution==8){
                this.maskLayer = outlines.features[0];
                this.childMaskLayer = null;
            }else{
                this.focus = this.childMaskLayer !== outlines.features[0];
                this.childMaskLayer = outlines.features[0];
            }
                
            this.refreshReact();
        }).catch(e => console.error(e));
    }
    getH3Layer(){
        if(!this.selectedYear || !this.selectedLayer || !this.selectedResolution) return;

        var url = './interpolation/' + this.selectedYear + '/' + this.selectedLayer + '/' +this.selectedResolution+ '/fid_' + this.currentArea[this.selectedResolution] + '_' +this.selectedResolution+ '.json';
       
        this._loadJson(url).then(outlines => {
            this.h3Layer = outlines;
            this.refreshReact();
        }).catch(e => {
            console.log(e);
        }).catch(e => console.error(e));
    }
    
    changeView(e){
        if(this.is3D !==e.viewState.pitch>0){
            this.is3D = e.viewState.pitch>0
            this.refreshReact();
        }
    }
    refreshReact(){
        var that = this;

        if(!this.selectedLayer) return;
        
        ReactDOM.render(
            <ReactApp data={this.h3Layer} maskData={this.maskLayer} childMaskData={this.childMaskLayer} parent={function(e){
                that.changeView(e)
            }} show3D={this.is3D} resolution={this.selectedResolution} layer={this.selectedLayer}/>,
            document.getElementById('react-gl')
        );
    }
    addView(name, view){
        this.views[name] = view;
    }
    focusLand(featureId){
        if(featureId == 0){
            this.selectedResolution = 8;
        }else{
            this.selectedResolution = 9;
            this.currentArea[this.selectedResolution] = featureId;
            this.currentArea[10] = null;
        }

        this.updateNavigation();
    }
    focusObf(featureId){
        if(featureId == 0){
            this.selectedResolution = 9;
            
        }else{
            this.selectedResolution = 10;
            this.currentArea[this.selectedResolution] = featureId
        }

        this.updateNavigation();
    }
    
    async _loadJson(url){
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return response.json();
    }
}

export default VWM;