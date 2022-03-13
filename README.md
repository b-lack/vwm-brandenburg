# Wildlife impact monitoring Brandenburg

![VWM-brandenburg](https://b-lack.github.io/vwm-brandenburg/images/open-graph-vwm-monitoring.jpg)

Illustration of regeneration condition and wildlife impact monitoring by [Brandenburg State Forestry Office](https://forst.brandenburg.de/).

See the [Demo](https://b-lack.github.io/vwm-brandenburg/) Application.

## Requirements

Ensure [node.js](https://nodejs.org/en/) is installed and the repository is cloned.

## Installation

Download and install dependencies defined in `package.json`:

```bash
npm install
```

or

```bash
yarn
```

## Usage

### Development

Running application in dev mode will bundle necessary features, starts a server and opens `docs/index.html` in the browser:

```bash
npm run dev
```

This may take a little while. If the browser does not open automatically, visit: [localhost:10001](http://localhost:10001)

### Build

Starts the build process of all necessary features ready for production.

```bash
# bundle and build the app
npm run build
```

This may take a little while.

## Geo Processing

`mask-from-feature-collection.js` splits FeatureCollection into multiple Features named by defined property used as mask.

```bash
node processing/geo/mask-from-feature-collection.js --property fid --featureFile /path/to/polygon/feature-collection.geojson --outputDir=dirname
```

- **property**: Name of the property used as feature name
- **featureFile**: Input geojson FeatureCollection
- **outputDir**: Output directory name in `./docs/geo/`

### Create H3 Grid

Creates list of H3 indexes bounded by geoJSON FeatureCollection and saves to `outputDir` folder.

```bash
node node processing/geo/geo-json-feature-to-h3.js --featureFile /path/to/mask/feature-collection.geojson --outputDir reviere --propertyId fid --resolution 10
```

- **featureFile**: GeoJSON FeatureCollection to be filled with H3 grid
- **outputDir**: Where files to be saved `/tmp/{$outputDir}/{$resolution}/'`
- **resolution**: According to the [Uber H3](https://github.com/uber/h3) resolution

## Data Processing

### Preparing Data from geoJSON

Extrudes coordinates and given monitoring attribute from geoJSON feature and creates `.json` file in `tmp/survey-data` folder.

```bash
node processing/data/translation_geojson.js --fileName /path/to/feature/with/monitored/attribute.geojson --attributeName Percentage
```

- **fileName**: GeoJSON FeatureCollection with monitored data in properties
- **attributeName**: Name of the property to be visualized

### Interpolatinf Data to H3 Grid

Calculates [Inverse-Distance-Weighting](https://github.com/NicolaiMogensen/Inverse-Distance-Weighting-JS/blob/master/idwJS.js) from given coordinates/values and outputs list of H3 indexes.

```bash
node processing/data/idw.mjs --year 2021 --dataFilePath /path/to/previously/created/file.json --resolution 10 --outputDir=verbiss
```

- **year**: GeoJSON FeatureCollection to be filled with H3 grid
- **dataFilePath**: path to previously created json file
- **outputDir**: Where files to be saved `/docs/interpolation/{$year}/{$outputDir}/{$resolution}/'`
- **resolution**: According to the [Uber H3](https://github.com/uber/h3) resolution

## Credits

Data provided by the Brandenburg State Forestry Office

[Wildschäden erfassen und vorbeugen](https://forst.brandenburg.de/lfb/de/ueber-uns/landeskompetenzzentrum-lfe/wildschaeden-erfassen-und-vorbeugen/#)

## Video / Presentation

This repository was presented at the "Fossgis2022" conference with a [live demo](https://media.ccc.de/v/fossgis2022-13988-ausschreibung-und-umsetzung-von-open-source-software-im-ffentlichen-dienst#t=2) (in German language).
