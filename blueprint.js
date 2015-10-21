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
	var $ = {};
	
	var bp = {
		story: blueprint.stories,
		sheet: blueprint.sheets,
		dimension: blueprint.dimensions,
		measure: blueprint.measures,
		masterobject: blueprint.masterobjects
	};
		
	return qsocks.Connect(config).then(function(global) {
			return $.global = global;
		}).then(function() {
			return $.global.openDoc(appid, '', '', '', false)
		})
		.then(function(app) {
			return $.app = app;
		})
		.then(function(app) {
			return $.app.getAllInfos()
		})
		.then(function(info) {
			return info.qInfos.filter(function(obj) {
				return Object.keys(bp).indexOf(obj.qType) !== -1;
			}).map(function(zip) {
				return zip.qId;
			});
		})
		.then(function(appObjectList) {
			return Promise.all(Object.keys(bp).map(function(method) {
				return bp[method].map(function(c) {
					return METHODS[method]($.app, c, appObjectList)
				})
			}))
		})
		.then(function() {
			return resolveDeletions($.app, blueprint);
		})
		.then(function() {
			return config.host === 'localhost' || '127.0.0.1' ? $.app.doSave() : $.app.saveObjects()
		}).then(function() {
			$.global.connection.ws.terminate()
			return $ = null;
		}).done()
};

module.exports = {
	applyTo: applyTo,
	getBlueprint: getBlueprint
};