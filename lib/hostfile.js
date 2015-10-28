var path = require('path')
var fs = require('fs')
var Promise = require('bluebird')
var config = require('../config')

function hostname() {
	return new Promise(function(resolve, reject) {	
		try {
			var host = fs.readFileSync( path.resolve(config.hostfile) ).toString()
			config.hostname = new Buffer(host, 'base64').toString()
			resolve(null)
		} catch (e) {
			reject(e)
		}
	})
}

module.exports = hostname