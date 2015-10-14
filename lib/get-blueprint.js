var qsocks = require('qsocks');
var serialize = require('serializeapp');

function getBlueprint(appId, config) {
		if(!appId || !config) return new Error('Missing appId or engine config');
		config.appname = appId;
		
		var global = qsocks.Connect(config);
		
		return global.then(function(global) {
			return global.openDoc(appId, '', '', '', true)
				.then(serialize)
				.then(function(blueprint) {
					global.connection.ws.close(1)
					return blueprint;
				})
		});
};

module.exports = getBlueprint;