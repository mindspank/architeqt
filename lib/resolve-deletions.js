var Promise = require('bluebird')

function resolveDeletions(app, blueprint) {
	var LIST = ['story', 'sheet', 'measure', 'dimension'];
	var bluePrintObjects = blueprint.blueprintObjectList.qInfos.filter(function(d) {
		return LIST.indexOf(d.qType) !== -1
	})
			
	var managedListDef = {
		qInfo: {
			qId: 'BlueprintManagedItems',
			qType: 'BlueprintManagedItems'
		}
	}
		
	return app.getAllInfos()
	.then(function(infos) {
		return infos.qInfos.filter(function(d) {
			return d.qId === 'BlueprintManagedItems'
		})
	})
	.then(function(o) {
		//Has never been synced before, add a fresh object.
		if (o.length === 0) {
			managedListDef[blueprint.blueprintId] = bluePrintObjects;
			return app.createObject(managedListDef)
		}
		return app.getObject('BlueprintManagedItems');
	})
	.then(function(handle) {
		return handle.getLayout().then(function(layout) {
			console.log(layout)
			return layout[blueprint.blueprintId].filter(function(d) {
				return bluePrintObjects.map(function(d) { return d.qId; }).indexOf(d) === -1
			})
		});
	})
	.then(function(objectsForDeletion) {
		console.log(objectsForDeletion)
		if (objectsForDeletion.length) {
			return Promise.all(objectsForDeletion.map(function(d) {
				return app.destroyObject(id)
			}))
		} else {
			return Promise.resolve()
		}
	})
	.then(function() {
		return app.getObject('BlueprintManagedItems').then(function(handle) {
			return handle.applyPatches([{
				qPath: '/' + blueprint.blueprintId,
				qOp: 'replace',
				qValue: '"' + bluePrintObjects + '"'
			}])
		})
	})
	
	
};
/*
qsocks.Connect({
			host: '127.0.0.1',
			isSecure: false,
			port: 4848
			}).then(function(global) {
	return global.openDoc('Child').then(function(app) {
		return blueprint.getBlueprint('Blueprint', {
			host: '127.0.0.1',
			isSecure: false,
			port: 4848
			}).then(function(blueprint) {
			return resolveDeletions(app, blueprint)			
		})
	})
}).catch(function(err) {console.log(err); })
*/

module.exports = resolveDeletions;