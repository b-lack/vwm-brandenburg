L.Mask = L.Polygon.extend({

    options: {
        stroke: false,
        color: '#fafafa',
        fillOpacity: 1,
        clickable: true,
        outerBounds: new L.LatLngBounds([-90, -360], [90, 360])
    },

    initialize: function (latLngs, options) {

         var outerBoundsLatLngs = [
            this.options.outerBounds.getSouthWest(),
            this.options.outerBounds.getNorthWest(),
            this.options.outerBounds.getNorthEast(),
            this.options.outerBounds.getSouthEast()
        ];

        L.Polygon.prototype.initialize.call(this, [outerBoundsLatLngs, latLngs], options);  
    }

});

L.mask = function (latLngs, options) {
    return new L.Mask(latLngs, options);
};