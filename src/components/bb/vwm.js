import Map from '../map/map'

class VWM{
    constructor(dataObj = {}) {
        //this.dataPath = dataPath;
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
            this.map.addParent(outlines, this.focusFeature.bind(this));
        });

        if(this.dataObj.mask){
            this.getMaskLayer(this.dataObj.mask);
        }
    }
    addJsonLayer(url){
        this._loadJson(url).then(outlines => {
            this.map.addObf(outlines, this.focusFeature.bind(this));
        });
    }
    getMaskLayer(url){
        this._loadJson(url).then(outlines => {
            this.map.addMask(outlines.features[0].geometry.coordinates[0][0]);
        });
    }
    getH3Layer(url){
        this._loadJson(url).then(outlines => {
            this.map.addPolygonsByH3(outlines.hexagons);
        });
    }
    addView(name, view){
        this.views[name] = view;
    }
    focusFeature(featureId, loadChild){
        if(loadChild)
        this.addJsonLayer('../data/geo/reviere/' + featureId + '.geojson'); // layer[0].polygons
        this.getH3Layer('../data/h3/obf_clean/' + featureId +'_8.json'); // layer[0].h3
        
        /*const layer = this.dataObj.children.filter(obf => obf.id == featureId);
        if(layer.length > 0){
            this.addJsonLayer('../data/geo/reviere/' + featureId + '.geojson'); // layer[0].polygons
            if(layer[0].h3){
                this.getH3Layer('../data/h3/obf_clean/' + featureId +'_8.json'); // layer[0].h3
            }
               
        }*/
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
    addMask(polygon){
        if(this.views[this.currentViewKey]){
            this.map.addMask(polygon);
            //this.map.addMask(this.views[this.currentViewKey].jsonOutlines.features[0].geometry.coordinates[0][0]);
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