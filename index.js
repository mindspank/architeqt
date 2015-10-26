var qsocks = require('qsocks');
var config = require('./config');
var bp = require('./blueprint')


bp.getBlueprint('f97c71d8-301c-429a-9992-c0af8044dec4', config.engine)
.then(function (blueprint) {
	return bp.applyTo(['12b6352a-866c-4ef1-bd3d-0908000cbcad', '0e374626-60ec-41c4-a221-395498f8a590'], blueprint, config.engine)
})
.catch(function (error) {
	console.log(error)
})
.done()