var qsocks = require('qsocks');
var restify = require('restify');

var config = require('./config');
var bp = require('./lib/blueprint');
var qrs = require('./lib/qrs-interactions')

var server = restify.createServer({
  certificate: config.cert.cert,
  key: config.cert.key,
  name: 'blueprint',
  version: '1.0.0'
});


server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/', function(req, res, next) {
  res.send('Welcome to Architeqt')
})

server.get('/blueprint/:id', function (req, res, next) {
  res.send(req.params);
  return next();
});

server.listen(3001, function () {
  console.log('%s listening at %s', server.name, server.url);
});






/*

bp.getBlueprint('f97c71d8-301c-429a-9992-c0af8044dec4', config.engine)
.then(function (blueprint) {
	return bp.applyTo(['87e3b3e0-7afb-40e0-aae3-373ea796cef4'], blueprint, config.engine)
})
.catch(function (error) {
	console.log(error)
})
.done()


*/