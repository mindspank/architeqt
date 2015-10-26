var extend = require('extend');
var Promise = require('bluebird');


/**
 * TODO - Add missing types
 * Variables
 * Support load script, can we lock a section??
 */

var blueprintTag = {
	isBlueprintItem: true,
	approved: true
};

// Accessor function to flatten array of arrays
var flatten = function(a, b) {
	return a.concat(b);
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
			return handle.setProperties(def).then(function() { return handle.publish(); });
		});
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setProperties(def).then(function() { return handle.publish(); });
		})
	}
}
function syncDimension(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	if (list.indexOf(def.qInfo.qId) === -1) {
		return app.createDimension(def).then(function(dim) { console.log(dim); return dim.publish(); });
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
			return measure.setProperties(def).then(function() { return measure.publish(); });
		})
	}	
}
function syncStory(app, def, list) {
	extend(def.qProperty.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def)
				.then(function() { return embedSnapshot(app, handle); })
				.then(function() { return handle.publish(); });
		})
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setFullPropertyTree(def)
				.then(function() { return embedSnapshot(app, handle); })
				.then(function() { return handle.publish(); });
		})
	}
}
function embedSnapshot(app, handle) {
	return handle.getChildInfos()
	.then(function(list) {
		return Promise.map(list.filter(function(d) { return d.qId }), function(d) {
			return app.getObject(d.qId);
		}, {concurency: 1})
	})
	.then(function(slides) {
		return Promise.map(slides, function(d) {
			return d.getChildInfos()
		}, {concurency: 1})
	})
	.then(function(slideitems) {
		return Promise.map(slideitems.reduce(flatten, []), function(item) {
			return app.getObject(item.qId);
		}, {concurency: 1})
	})
	.then(function(itemlist) {
		return Promise.map(itemlist, function(d) {
			return d.getLayout();
		}, {concurency: 1})
		.then(function(layouts) {
			return Promise.each(layouts, function(layout, index) {
				if(layout.style.id) {
					return itemlist[index].embedSnapshotObject(layout.style.id)
				} else {
					return Promise.resolve()
				}
			})
		})
	})
}
function syncSnapshot(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	if (list.indexOf(def.qInfo.qId) === -1) {
		return app.createBookmark(def).then(function(handle) { console.log(handle); return handle.publish(); });
	} else {
		return app.getBookmark(def.qInfo.qId).then(function(handle) {
			return handle.setProperties(def).then(function() { return handle.publish(); });
		})
	}	
}

module.exports = {
	sheets: syncSheet,
	dimensions: syncDimension,
	measures: syncMeasure,
	snapshots: syncSnapshot,
	stories: syncStory,
	masterobjects: syncMasterObject
}