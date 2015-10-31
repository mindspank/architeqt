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

	return qsocks.Connect(config).then(function(global) {
		return global.openDoc(childId, '', '', '', true)
	})
	.then(function(app) {
		return app.getAllInfos()
		.then(function(infos) {
			return infos.qInfos.filter(function(d) {
				return d.qId === 'BlueprintManagedItems'
			})
		})
		.then(function(o) {
			if (o.length === 0) {
				throw new Error('App has no blueprint items')
			}
			return app.getObject('BlueprintManagedItems');
		})
		.then(function(handle) {
			return handle.getLayout().then(function(layout) {
				if (!layout[blueprintId]) {
					throw new Error('App is not assoicated with blueprint ' + blueprintId)
				}
				
				console.log(layout[blueprintId])
				
			})
		})		
	})
};
module.exports = removeBlueprintItems;