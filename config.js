var fs = require('fs');

/**
 * Location for Qlik Sense certs.
 * No need to change on a standard Qlik Sense installation
 */
var certs = {
	server_key: fs.readFileSync('C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/server_key.pem'),
	server_cert: fs.readFileSync('C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/server.pem'),
	key: fs.readFileSync('C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/client_key.pem'),
	cert: fs.readFileSync('C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/client.pem'),
	ca: fs.readFileSync('C:/ProgramData/Qlik/Sense/Repository/Exported Certificates/.Local Certificates/root.pem')
}

/**
 * Custom Properties used in QMC.
 */
var qmcConfig = {
	blueprintProp: 'Blueprint',
	childAppProp: 'UseBlueprint'
};

/**
 * Qsocks config to connect directly to the QIX Engine
 * See https://github.com/mindspank/qsocks for more docs
 */
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

/**
 * QRS Config to connect directly to QRS.
 * See https://github.com/stefanwalther/qrs for more docs
 */
var qrsconfig = {
	host: 'usrad-akl.qliktech.com',
	authentication: 'certificates',
	useSSL: true,
	port: 4242,
	headerKey: 'X-Qlik-User',
	headerValue: 'UserDirectory=Internal;UserId=sa_repository',
	key: certs.key,
	cert: certs.cert,
	ca: certs.ca
}

module.exports = {
	engine: engineconfig,
	qrs: qrsconfig,
	qmc: qmcConfig,
	cert: certs
};