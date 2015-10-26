var fs = require('fs');

var certs = {
	key: fs.readFileSync('./certs/client_key.pem'),
	cert: fs.readFileSync('./certs/client.pem'),
	ca: fs.readFileSync('./certs/root.pem')
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
	useSSL: true,
	port: '4242',
	headers: {
		'X-Qlik-User': 'UserDirectory=Internal;UserId=sa_repository'
	},
	key: certs.key,
	cert: certs.cert
}

module.exports = {
	engine: engineconfig,
	qrs: qrsconfig
};