var qsocks = require('qsocks');
var Promise = require('bluebird');
var METHODS = require('./lib/assemble-blueprint');


function applyTo(applist, blueprint, config) {
	
	var bp = {
		story: blueprint.stories,
		sheet: blueprint.sheets,
		dimension: blueprint.dimensions,
		measure: blueprint.measures
	}

	return applist.reduce(function(cur, next) {
		return cur.then(function() {
			return apply(next, bp, config)
		});
	}, Promise.resolve()).then(function() {
		console.log('all executed')
	});

};

function apply(appid, blueprint, config) {
	config.appname = appid;
	var $ = {};
		
	return qsocks.Connect(config)
		.then(function(global) {
			return global.openDoc(appid, '', '', '', true)
		})
		.then(function(app) {
			return $.app = app;
		})
		.then(function(app) {
			return $.app.getAllInfos()
		})
		.then(function(info) {
			return info.qInfos.filter(function(obj) {
				return Object.keys(blueprint).indexOf(obj.qType) != -1;
			}).map(function(zip) {
				return zip.qId;
			});
		})
		.then(function(appObjectList) {
			return Promise.all(Object.keys(blueprint).map(function(method) {
				return blueprint[method].map(function(c) {
					return METHODS[method]($.app, c, appObjectList)
				})
			}))
		})
		.then(function() {
			return $.app.saveObjects()
		})
}

module.exports = {
	applyTo: applyTo
};