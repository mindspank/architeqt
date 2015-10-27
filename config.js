var fs = require('fs');

var certs = {
	key: fs.readFileSync('./certs/client_key.pem'),
	cert: fs.readFileSync('./certs/client.pem'),
	ca: fs.readFileSync('./certs/root.pem')
}

var qmcConfig = {
	blueprintProp: 'Template',
	childAppProp: 'UseTemplate'
}

var engineconfig = {
	host: 'usrad-akl.qliktech.com',
	isSecure: true,
	port: '4747',
	headers: {
		'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_repository'
	},
	key: certs.key,
	cert: certs.cert,
	ca: certs.ca
};

var qrsconfig = {
	host: 'usrad-akl.qliktech.com',
	authentication: 'certificates',
	useSSL: true,
	port: 4242,
	headerKey: 'X-Qlik-User',
	headerValue: 'UserDirectory=Internal;UserId=sa_repository',
	key: './certs/client_key.pem',
	cert: './certs/client.pem',
	ca: './certs/root.pem'
}

module.exports = {
	engine: engineconfig,
	qrs: qrsconfig,
	qmc: qmcConfig
};