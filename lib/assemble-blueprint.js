var extend = require('extend');


/**
 * TODO - Add missing types
 * Variables
 * Snapshots
 * Support load script?
 */

var blueprintTag = {
	isBlueprintItem: true,
	approved: true
}

function syncSheet(app, def, list) {
	extend(def.qProperty.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		});
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		})
	}
}
function syncMasterObject(app, def, list) {
	extend(def.qProperty.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		});
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		})
	}
}
function syncDimension(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	if (list.indexOf(def.qInfo.qId) === -1) {
		return app.createDimension(def).then(function(dim) { return dim.publish(); });
	} else {
		return app.getDimension(def.qInfo.qId).then(function(dim) { 
			return dim.setProperties(def).then(function() { return dim.publish(); })
		})
	}
}
function syncMeasure(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	if (list.indexOf(def.qInfo.qId) === -1) {
		return app.createMeasure(def).then(function(measure) { return measure.publish(); });
	} else {
		return app.getMeasure(def.qInfo.qId).then(function(measure) { 
			return measure.setProperties(def).then(function() {
				return measure.publish();
			})
		})
	}	
}
function syncStory(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		});
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		})
	}	
}

module.exports = {
	sheet: syncSheet,
	dimension: syncDimension,
	measure: syncMeasure,
	story: syncStory,
	masterobject: syncMasterObject
}