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

```bash

node node processing/geo-json-feature-to-h3.js --featureFile /path/to/mask/featur-collection.geojson --outputDir reviere --propertyId fid --resolution 10
```

```bash
node processing/clean-by-forst.js --outputDir reviere --resolution 10
```

```bash
node processing/idw.mjs --resolution 10
```
