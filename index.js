var qsocks = require('qsocks');
var config = require('./config');
var bp = require('./blueprint')


bp.getBlueprint('359b3fec-4a30-4f5c-a0ff-72a931042f07', config.engine)
.then(function (blueprint) {
	return bp.applyTo(['92587096-5119-44a0-8c27-e0576a17934b'], blueprint, config.engine)
})
.catch(function (error) {
	return console.log(error)
})
.done()