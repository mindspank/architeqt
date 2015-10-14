/**
 * TODO - Add missing types
 * Variables
 * Masterobjects
 * Snapshots
 * Support load script?
 */

function syncSheet(app, def, list) {
	def.qProperty.qMetaDef.approved = true
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
	if (list.indexOf(def.qInfo.qId) === -1) {
		return app.createDimension(def).then(function(dim) { return dim.publish(); });
	} else {
		return app.getDimension(def.qInfo.qId).then(function(dim) { 
			return dim.setProperties(def).then(function() { return dim.publish(); })
		})
	}
}
function syncMeasure(app, def, list) {
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
	def.qProperty.qMetaDef.approved = true
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
	story: syncStory
}