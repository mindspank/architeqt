var Promise = require('bluebird')

function resolveDeletions(app, blueprint) {
	
	var LIST = ['measure', 'dimension', 'masterobject', 'snapshot'];
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
			if (!layout[blueprint.blueprintId]) {
				return handle.getProperties().then(function(props) {
					props[blueprint.blueprintId] = bluePrintObjects;
					return handle.setProperties(props);
				}).then(function() {
					return handle.getLayout();
				})
			} else {
				return layout;
			}
		});
	})
	.then(function(layout) {
		return layout[blueprint.blueprintId].filter(function(d) {
			return bluePrintObjects.map(function(d) { return d.qId; }).indexOf(d.qId) === -1
		})
	})
	.then(function(objectsForDeletion) {
		if (objectsForDeletion.length) {
			return Promise.all(objectsForDeletion.map(function(d) {
				if(d.qType === 'measure') {
					return app.destroyMeasure(d.qId)
				}
				if(d.qType === 'dimension') {
					return app.destroyDimension(d.qId)
				}
				if(d.qType === 'snapshot') {
					return app.destoryBookmark(d.qId)
				}			
				return app.destroyObject(d.qId)
			}))
		} else {
			return Promise.resolve()
		}
	})
	.then(function() {
		return app.getObject('BlueprintManagedItems').then(function(handle) {
			return handle.getProperties().then(function(props) {
				props[blueprint.blueprintId] = bluePrintObjects;
				return handle.setProperties(props);
			})
		})
	})
	
};
module.exports = resolveDeletions;