var qsocks = require('qsocks');
var serialize = require('serializeapp');
var Promise = require('bluebird')

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
		
		var global = qsocks.Connect(config);
		
		return global.then(function(global) {
			return global.openDoc(appId, '', '', '', true)
				.then(serialize)
				.then(function(blueprint) {
					return global.getActiveDoc().then(function(app) {
						return Promise.all([Promise.resolve(blueprint), app.getAllInfos()])
					})
				})
				.then(function(results) {
					global.connection.ws.terminate()
					global = null;
					results[0].blueprintId = appId;
					results[0].blueprintObjectList = results[1];
					return results[0];
				})
		});
};

module.exports = getBlueprint;