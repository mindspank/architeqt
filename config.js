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
 * Architeqt settings
 */
var architeqtconfig = {
	promoteBlueprintSheets: true,
	excludePrefix: 'EXCLUDE'
}

/**
 * REST Server Configuration
 */
var restserver = {
	port: 3000,
	restrictCrossOrigin: true,
	hostClientUI: true,
	crossOriginHost: 'https://localhost',
	useHTTPS: true,
	httpsServerOptions: {
		ca: [certs.cert.ca],
		cert: certs.server_cert,
		key: certs.server_key,
		rejectUnauthorized: false,
		requireCertificate: false
	}
}

/**
 * Qsocks config to connect directly to the QIX Engine
 * See https://github.com/mindspank/qsocks for more docs
 * IMPORTANT: This is the hostname QlikSense services uses, the one that was supplied during installation.
 */
var engineconfig = {
	host: 'localhost',
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
 * IMPORTANT: This is the hostname QlikSense services uses, the one that was supplied during installation.
 */
var qrsconfig = {
	host: 'localhost',
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
	architeqt: architeqtconfig,
	qrs: qrsconfig,
	qmc: qmcConfig,
	cert: certs,
	rest: restserver
};