var qsocks = require('qsocks');
//var config = require('./config');
var bp = require('./blueprint')
var c = {
	host: '127.0.0.1',
	isSecure: false,
	port: 4848
}

bp.getBlueprint('Blueprint', c)
	.then(function (blueprint) {
		return bp.applyTo(['Child'], blueprint, c)
	})
	.catch(function (error) {
		console.log(error)
	})
	.done()