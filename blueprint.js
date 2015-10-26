var qsocks = require('qsocks');
var Promise = require('bluebird');
var getBlueprint = require('./lib/get-blueprint');
var METHODS = require('./lib/assemble-blueprint');
var resolveDeletions = require('./lib/resolve-deletions');

function applyTo(applist, blueprint, config) {
		
	return applist.reduce(function(cur, next) {
		return cur.then(function() {
			return apply(next, blueprint, config)
		});
	}, Promise.resolve());
};

function apply(appid, blueprint, config) {
	config.appname = appid;
	
	// qsocks content cache.
	var $ = {};
	
	var SUPPORTED_OBJECT_TYPES = ['story', 'sheet', 'measure', 'dimension', 'masterobject', 'snapshot'];
	var METHODS_MAP = ['sheets', 'measures', 'dimensions', 'masterobjects', 'snapshots', 'stories'];
			
	return qsocks.Connect(config).then(function(global) {
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
			return $.app.saveObjects()
		}).then(function() {
			// Clean up and free up connections.
			return $ = null && $.global.connection.ws.terminate()
		})
		.catch(function(err) {
			return console.log(err)
		}).done()
};

module.exports = {
	applyTo: applyTo,
	getBlueprint: getBlueprint
};