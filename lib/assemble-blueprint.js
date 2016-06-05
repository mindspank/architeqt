var extend = require('extend');
var Promise = require('bluebird');

/**
 * TODO: Variables
 * Support load script, can we lock a section??
 */


/**
 * Appended onto Generic Objects to tag them as blueprint item
 * Sets the approved flag to tell the client that it's a base core app item.
 */
var blueprintTag = {
	isBlueprintItem: true,
	approved: true
};

// Accessor function to flatten array of arrays
var flatten = function(a, b) {
	return a.concat(b);
}
function syncVariable(app, def, list) {
	extend(def.qMetaDef, blueprintTag)
	return app.createVariableEx(def).then(function(handle) {
		return handle.setProperties(def);
	}, function(err) {
		if(err.code == '18001') {
			return app.getVariableById(def.qInfo.qId).then(function(handle) { return handle.setProperties(def); })
		} else {
			throw new Error(err);
		}
	})
}
function syncSheet(app, def, list) {
	extend(def.qProperty.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def).then(function() { return handle.publish(); });
		})
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
			return measure.setProperties(def).then(function() { return measure.publish(); });
		})
	}	
}
function syncStory(app, def, list) {
	extend(def.qProperty.qMetaDef, blueprintTag)
	if (list.indexOf(def.qProperty.qInfo.qId) === -1) {
		return app.createObject(def.qProperty).then(function(handle) {
			return handle.setFullPropertyTree(def)
				.then(function() { return embedSnapshot(app, handle, def); })
				.then(function() { return handle.publish(); });
		})
	} else {
		return app.getObject(def.qProperty.qInfo.qId).then(function(handle) {
			return handle.setFullPropertyTree(def)
				.then(function() { return embedSnapshot(app, handle, def); })
				.then(function() { return handle.publish(); });
		})
	}
}
function embedSnapshot(app, handle, def) {
	return handle.getChildInfos()
	.then(function(list) {
		return Promise.all(list.filter(function(d) { return d.qId }).map(function(d) {
			return app.getObject(d.qId);
		}))
	})
	.then(function(slides) {
		return Promise.all(slides.map(function(d) {
			return d.getChildInfos()
		}))
	})
	.then(function(slideitems) {
		return Promise.all(slideitems.reduce(flatten, []).map(function(item) {
			return app.getObject(item.qId);
		}))
	})
	.then(function(itemlist) {
		return Promise.all(itemlist.map(function(d) {
			return d.getLayout();
		}))
		.then(function(layouts) {
			return Promise.each(layouts, function(layout, index) {
				if(layout.style.id) {
					
					var filtered = def.qChildren.reduce(function(a,b) {
						return a.concat(b.qChildren)
					}, []).filter(function(d) {
						return d.qProperty.qInfo.qId === layout.qInfo.qId;
					}).map(function(d) {
						return d.qEmbeddedSnapshotRef
					})
					
					return itemlist[index].embedSnapshotObject(layout.style.id)
						.then(function() {
							return itemlist[index].getSnapshotObject()						
						})
						.then(function(handle) {
							filtered[0].qProperties.qInfo = layout.qInfo;
							return handle.setProperties(filtered[0].qProperties)
						})	
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
		return app.createBookmark(def).then(function(handle) { return handle.publish(); });
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
	masterobjects: syncMasterObject,
	variables: syncVariable
}