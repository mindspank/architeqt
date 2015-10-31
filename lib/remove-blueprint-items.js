var qsocks = require('qsocks');
var Promise = require('bluebird');

/**
 * Manages object removal in a blueprint.
 * Sheets & stories are refreshed on sync so no need to manage individual item removal.
 * 
 * @param {Object} app qsocks app connection
 * @param {Object} blueprint Blueprint definition
 * @returns {Object} Returns Promise
 */
function removeBlueprintItems(childId, blueprintId, config) {

	config.appname = childId;
	var $ = {};

	return qsocks.Connect(config).then(function(global) { return $.global = global; }).then(function(global) {
		return $.global.openDoc(childId, '', '', '', true)
	})
	.then(function(app) { return $.app = app; })
	.then(function() {
		return $.app.getAllInfos().then(function(infos) {
			return infos.qInfos.filter(function(d) {
				return d.qId === 'BlueprintManagedItems'
			})
		})
		.then(function(o) {
			if (o.length === 0) {
				throw new Error('App has no blueprint items')
			}
			return $.app.getObject('BlueprintManagedItems');
		})
		.then(function(handle) {
			return handle.getLayout().then(function(layout) {
				if (!layout[blueprintId]) {
					throw new Error('App is not assoicated with blueprint ' + blueprintId)
				}
				return Promise.all(layout[blueprintId].map(function(d) {
					if(d.qType === 'measure') {
						return $.app.destroyMeasure(d.qId)
					}
					if(d.qType === 'dimension') {
						return $.app.destroyDimension(d.qId)
					}			
					if(d.qType === 'snapshot') {
						return $.app.destroyBookmark(d.qId)
					}
					if(d.qType === 'variable') {
						return $.app.destroyVariableById(d.qId);
					}
					// Generic Obects
					return $.app.destroyObject(d.qId)
				}))
				.then(function() {
					return handle.getProperties().then(function(props) {
						delete props[blueprintId];
						return handle.setProperties(props);
					})
				})
			})
		})
		.then(function() {
			return $.app.saveObjects();
		})	
	}).then(function() {
		$.global.connection.ws.terminate()
		return $ = null;
	})
};
module.exports = removeBlueprintItems;