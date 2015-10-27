var config = require('./config');
var QRS = require('qrs');
var qrs = new QRS(config.qrs);


/**
 * Fetches all defined blueprints
 * Supply a blueprint id to fetch a single blueprint.
 */
function getTemplate(id) {
	var templateTrue = '@' + config.qrs.blueprintProp + '+eq+true';
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
	var hasBlueprint = '@' + config.qrs.childAppProp + '+so+-';
	var obj = {
		key: 'filter', 
		value: blueprintId ? '@' + config.qrs.childAppProp + '+eq+' + blueprintId : hasBlueprint
	};
	return qrs.get('app/full', [obj], null);	
}
