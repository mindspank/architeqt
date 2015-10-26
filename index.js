var qsocks = require('qsocks');
var QRS = require('qrs');

var config = require('./config');
var bp = require('./blueprint');



/*
bp.getBlueprint('f97c71d8-301c-429a-9992-c0af8044dec4', config.engine)
.then(function (blueprint) {
	return bp.applyTo(['87e3b3e0-7afb-40e0-aae3-373ea796cef4', 'd93cdab0-196e-4287-9ed6-8ba7191dae66'], blueprint, config.engine)
})
.catch(function (error) {
	console.log(error)
})
.done()

*/