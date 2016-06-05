var qsocks = require('qsocks');
var serializeApp = require('serializeapp');
var Promise = require('bluebird');

var conf = require('../config');

/**
 * Fetch a blueprint definition.
 * 
 * @param {String} appId Application GUID to serialize
 * @param {Object} config qsocks configuration obect.
 * 
 * @returns {Object} Application definition serialized into JSON.
 */
function getBlueprint(appId, config) {
		if(!appId || !config) return new Error('Missing appId or engine config');
		config.appname = appId;

		// Connect to Qlik Sense
		var global = qsocks.Connect(config);
		
		return global.then(function(global) {
			
			// Open app without data to reduce loading time.
			return global.openDoc(appId, '', '', '', true)
				.then(serializeApp) // Serialize app into JSON
                .then(function(blueprint) {
                    if (blueprint.sheets) {
                        blueprint.sheets = blueprint.sheets.filter(function(d) {
                            return !d.qProperty.qMetaDef.title.match(conf.architeqt.excludePrefix);
                        });
                        return blueprint
                    } else {
                        return blueprint;
                    };
                })
				.then(function(blueprint) {
					return global.getActiveDoc().then(function(app) {
						// Fetch object list - used to tag objects in children
						return Promise.all([Promise.resolve(blueprint), app.getAllInfos()])
					})
				})
				.then(function(results) {
                    // Make sure we purge any excluded sheets.
                    if (results[0].sheets) {
                        var sheetids = results[0].sheets.map(function(d) {
                            return d.qProperty.qInfo.qId;
                        })
                        
                    }
                    results[1] = results[1].qInfos.filter(function(d) {
                        if(d.qType !== 'sheet') {
                            return d;
                        } else {
                            return sheetids.indexOf(d.qId) > -1;
                        };                     
                    });
					
					// Purge and config / reserve and script created variables
					if ( results[0].variables ) {
						results[0].variables = results[0].variables.filter(function(d) {
							return (!d.qIsScriptCreated && !d.qIsReserved && !d.qIsConfig);
						})
					};
					
					// Promote blueprint sheets to first item
					if ( conf.architeqt.promoteBlueprintSheets ) {
						results[0].sheets = results[0].sheets.map(function(sheet) {
							sheet.qProperty.rank = sheet.qProperty.rank / 100;
							return sheet;
						})
					};
                                        
					// Clean up connections
					global.connection.ws.terminate()
					global = null;
					
					// Append metadata
					results[0].blueprintId = appId;
					results[0].blueprintObjectList = { qInfos: results[1] };

					return results[0];
				});
		});
};

module.exports = getBlueprint;