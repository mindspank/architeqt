var qsocks = require('qsocks');
var getBlueprint = require('./lib/get-blueprint');
var config = require('./engineconfig');
var applyBlueprint = require('./applyBlueprint')

getBlueprint('88503d1b-9386-436c-9c0e-c38186d43c3a', config.engine)
.then(function(blueprint) {
	return applyBlueprint.to(['61740c55-16f2-4db2-90d4-891d5975395e', '61740c55-16f2-4db2-90d4-891d5975395e'], blueprint, config.engine)
})
.catch(function(error) {
	console.log(error)
})
.done()