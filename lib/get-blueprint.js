var qsocks = require('qsocks');
var serializeApp = require('serializeapp');
var Promise = require('bluebird');

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
					return global.getActiveDoc().then(function(app) {
						// Fetch object list - used to tag objects in children
						return Promise.all([Promise.resolve(blueprint), app.getAllInfos()])
					});
				})
				.then(function(results) {

					// Clean up connections
					global.connection.ws.terminate()
					global = null;
					
					// Append metadata
					results[0].blueprintId = appId;
					results[0].blueprintObjectList = results[1];
					
					return results[0];
				})
		});
};

module.exports = getBlueprint;