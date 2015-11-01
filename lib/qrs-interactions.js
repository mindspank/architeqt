(function() {

var config = require('../config');
var QRS = require('qrs');
var Promise = require('bluebird');
var qrs = new QRS(config.qrs);

/**
 * Fetches all defined blueprints
 * Supply a blueprint id to fetch a single blueprint.
 */
function getTemplate(id) {
	var templateTrue = '@' + config.qmc.blueprintProp + '+eq+true';
	var obj = {
		key: 'filter', 
		value: id ? templateTrue + '+and+' + 'id+eq+' + id : templateTrue
	};
	
	return qrs.get('app/full', [obj], null);
}

/**
 * Fetches all apps that uses Blueprints
 * Supply a blueprintId to fetch child apps of a specfic blueprint
 */
function getChildApps(blueprintId) {
	var hasBlueprint = '@' + config.qmc.childAppProp + '+so+-';
	var obj = {
		key: 'filter', 
		value: blueprintId ? '@' + config.qmc.childAppProp + '+eq+' + blueprintId : hasBlueprint
	};
	return qrs.get('app/full', [obj], null);
}

/**
 * Gets all blueprints for child
 */
function getBlueprintsForChild(childId) {
	return qrs.get('qrs/app/' + childId, null, null).then(function(data) {
		if(!data.customProperties.length) {
			throw new Error('No Blueprints assigned');
		}
		
		var blueprintIds = data.customProperties.filter(function(d) {
			return d.definition.name === config.qmc.childAppProp
		}).map(function(d) {
			return d.value 
		});
		
		return Promise.all(blueprintIds.map(function(d) {
			return getTemplate(d)
		}))
	})
};

/**
 * Removes a child from blueprint.
 * Purges objects in app and removes the custom property assignment.
 */
function removeChildFromBlueprint(childId, blueprintId) {
	
	return qrs.get('qrs/app/' + childId, null, null)
	.then(function(data) {

		data.customProperties = data.customProperties.filter(function(d) {
			return d.value !== blueprintId;
		})
		return qrs.put('/qrs/app/', childId, null, data)
	})
}

/**
 * Sets item as approved in QRS
 * @param {String} appId QRS App GUID
 * @param {String} ObjectId The Engine object ID
 * @return {Promise}
 */
function setItemAsApproved(appId, objectId) {
    
  var filter = {
    key: 'Filter',
    value: "app.id+eq+" + appId + "+and+engineObjectId+eq+'" + objectId + "'+and+approved+eq+false",
  }
  
  return qrs.get('/qrs/app/object/full', [filter], null).then(function(data) {
    if (!data.length) {
      return new Error('No object found')
    }
    
    data[0].approved = true;
    data[0].modifiedDate = new Date().toISOString();

    return qrs.put('/qrs/app/object/', data[0].id, null, data[0])
    
  });
  
};

/**
 * Gets all apps not marked as a blueprint.
 */
function getNonBlueprints() {
	var isBlueprint = '@' + config.qmc.blueprintProp + '+ne+true'
	var obj = {
		key: 'filter', 
		value: isBlueprint
	};
	
	return qrs.get('/app/full', [obj], null)
};

module.exports = {
	getBlueprint: getTemplate,
	getBlueprintChildren: getChildApps,
	removeChildFromBlueprint: removeChildFromBlueprint,
	getBlueprintsForChild: getBlueprintsForChild,
	approveObject: setItemAsApproved,
	getNonBlueprints: getNonBlueprints
}

})()

