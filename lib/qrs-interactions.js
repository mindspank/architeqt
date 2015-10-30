(function() {

var config = require('../config');
var QRS = require('qrs');
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

module.exports = {
	getBlueprint: getTemplate,
	getBlueprintChildren: getChildApps,
	approveObject: setItemAsApproved
}

})()

