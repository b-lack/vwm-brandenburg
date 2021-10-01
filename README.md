# VWM-brandenburg

Darstellung von Verjüngungszustands- und Wildeinflussmonitoring.

## Usage

```bash
# install dependencies
npm install
# or
yarn
# bundle and serve the app
npm run dev

# bundle and build the app
npm run build
```

## Processing

### Data Processing

Projects given etrs coordinates to WGS84 and saves json file to `tmp/survey-data` folder.

```bash
node processing/data/translation.js
```

Creates H3 list for given geojson FeatureCollection and saves in `outputDir` folder.

```bash
node node processing/geo-json-feature-to-h3.js --featureFile /path/to/mask/featur-collection.geojson --outputDir reviere --propertyId fid --resolution 10
```

```bash
node processing/clean-by-forst.js --outputDir reviere --resolution 10
```

Calculates Inverse-Distance-Weighting from given coordinates/values and list of H3 indexes. Saves results in `tmp/interpolation` folder.

```bash
node processing/idw.mjs --resolution 10
```
