var qsocks = require('qsocks');
var config = require('./config');
var bp = require('./blueprint')


bp.getBlueprint('f97c71d8-301c-429a-9992-c0af8044dec4', config.engine)
.then(function (blueprint) {
	return bp.applyTo(['82050482-cafa-40d3-8468-df640c98b7c2'], blueprint, config.engine)
})
.catch(function (error) {
	console.log(error)
})
.done()