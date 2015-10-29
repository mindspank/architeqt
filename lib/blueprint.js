var qsocks = require('qsocks');
var Promise = require('bluebird');
var getBlueprint = require('./get-blueprint');
var METHODS = require('./assemble-blueprint');
var resolveDeletions = require('./resolve-deletions');
var qrs = require('./qrs-interactions');

/**
 * Calls function apply sequentially for each app in the applist.
 * @param [Array] applist Array of application ids
 * @param {Object} blueprint Application blueprint
 * @param {Object} config Qsocks connection object
 * 
 * @returns {Promise}
 */
function applyTo(applist, blueprint, config) {
	return Promise.all(applist.map(function(app) {
		return apply(app, blueprint, config)
	}))
};

function apply(appid, blueprint, config) {
	return new Promise(function(resolve, reject) {
		var c = config;
		c.appname = appid;
				
		var blueprintObjectIds = blueprint.blueprintObjectList.qInfos.map(function(d) {
			return d.qId
		}, [])
						
		// qsocks content cache.
		var $ = {};
			
		var SUPPORTED_OBJECT_TYPES = ['story', 'sheet', 'measure', 'dimension', 'masterobject', 'snapshot'];
		var METHODS_MAP = ['sheets', 'measures', 'dimensions', 'masterobjects', 'snapshots', 'stories'];
				
		return qsocks.Connect(c).then(function(global) {
				return $.global = global;
			}).then(function() {
				return $.global.openDoc(appid, '', '', '', true);
			})
			.then(function(app) {
				return $.app = app;
			})
			.then(function(app) {
				return $.app.getAllInfos()
			})
			.then(function(info) {
				return info.qInfos.filter(function(obj) {
					return SUPPORTED_OBJECT_TYPES.indexOf(obj.qType) !== -1;
				}).map(function(zip) {
					return zip.qId;
				});
			})
			.then(function(appObjectList) {
				return Promise.each(METHODS_MAP, function(method) {
					if (blueprint[method] && blueprint[method].length) {
						return Promise.all(blueprint[method].map(function(definition) {
							return METHODS[method]($.app, definition, appObjectList)
						}))
					} else {
						return Promise.resolve();
					}
				})
			})
			.then(function() {
				return resolveDeletions($.app, blueprint);
			})
			.then(function() {
				return $.app.saveObjects();
			})
			.then(function() {
				return Promise.map(blueprintObjectIds, function(d) {
					return qrs.approveObject(appid, d)
				})				
			})
			.then(function() {
				// Clean up and free up connections.
				$.global.connection.ws.terminate()
				return $ = null;
			})
			.then(function() {
				return resolve()
			}).catch(function(error) {
				return reject(error)
			})
	})

};

module.exports = {
	applyTo: applyTo,
	getBlueprint: getBlueprint
};