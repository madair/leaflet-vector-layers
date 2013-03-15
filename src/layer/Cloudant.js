lvector.Cloudant = lvector.GeoJSONLayer.extend({
    initialize: function(options) {  
        // Check for required parameters
        for (var i = 0, len = this._requiredParams.length; i < len; i++) {
            if (!options[this._requiredParams[i]]) {
                throw new Error("No \"" + this._requiredParams[i] + "\" parameter found.");
            }
        }
        
        // Extend Layer to create Cloudant
        lvector.Layer.prototype.initialize.call(this, options);
        
        // _globalPointer is a string that points to a global function variable
        // Features returned from a JSONP request are passed to this function
        this._globalPointer = "Cloudant_" + Math.floor(Math.random() * 100000);
        window[this._globalPointer] = this;
        
        // Create an array to hold the features
        this._vectors = [];
        
        if (this.options.map) {
            if (this.options.scaleRange && this.options.scaleRange instanceof Array && this.options.scaleRange.length === 2) {
                var z = this.options.map.getZoom();
                var sr = this.options.scaleRange;
                this.options.visibleAtScale = (z >= sr[0] && z <= sr[1]);
            }
            this._show();
        }
    },
    
    options: {
        dbName: null,
        designDoc: null,
        indexName: null
    },
    
    _requiredParams: ["dbName", "designDoc", "indexName"],
    
    _getFeatures: function() {
        // If we don't have a uniqueField value it's hard to tell if new features are duplicates so clear them all
        if (!this.options.uniqueField) {
            this._clearFeatures();
        }
        
        // Build URL
        // for now make this localhost, but this will point to cloudant
        var url = "http://localhost/" + this.options.dbName + 
            "/" + this.options.designDoc + 
            "/" + "_geo" +
            "/" + this.options.indexName + 
            "?callback=" + this._globalPointer + "._processFeatures"; // need this for jsonp

        if (!this.options.showAll) {
            url += "&bbox=" + this.options.map.getBounds().toBBoxString() +
            "/" + "&include_docs=true"; // Build bbox geometry
        }
        
        // JSONP request
        this._makeJsonpRequest(url);
        
    }
    
});
