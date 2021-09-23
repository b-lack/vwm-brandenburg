import Map from '../map/map'

class VWM{
    constructor(dataPath = '../data/bb_7_geo.json') {
        this.dataPath = dataPath;
        this.map = new Map();
        this.views = {}
        this.currentView = null
        this.dataValid = {geoData: false, data: true};
        this.currentLayerKey = null;
        this.currentViewKey = '';
        
        //this.refreshData(this.dataPath);
        
    }
    addView(name, view){
        this.views[name] = view;
    }
    changeView(name){
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
    }
    changeLayer(layerKey){
        if(!this.views[this.currentViewKey].dataLayer[layerKey] || this.currentLayerKey === layerKey) return false;
        
        this.dataValid.data = false;

        let newView = this.views[this.currentViewKey];
        if(newView.dataLayer[layerKey].jsonData){
            this.currentLayerKey = layerKey;
            this.addDataLayer();
            //this.map.addPolygonsByH3(newView.dataLayer[this.currentLayerKey].jsonData);
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
    }
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
    }*/
    addMask(){
        if(this.views[this.currentViewKey]){
            this.map.addMask(this.views[this.currentViewKey].jsonOutlines.features[0].geometry.coordinates[0][0]);
        }
           
    }
    removeMask(){
        return this.map.removeMask();
    }
    addMap(elementId, basemap, geoDataPath = '../data/land_small.json'){
        this.geoDataPath = geoDataPath;
        //this.refreshGeoData(this.geoDataPath);
        this.map.init(elementId, basemap);
        return this.map;
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