var qsocks = require('qsocks');
var restify = require('restify');
var Promise = require('bluebird');

var config = require('./config');
var bp = require('./lib/blueprint');
var qrs = require('./lib/qrs-interactions')

var server = restify.createServer({
  name: 'blueprint',
  version: '1.0.0',
  httpsServerOptions: {
    hostname: 'usrad-akl.qliktech.com',
    ca: [config.cert.ca],
    cert: config.cert.cert,
    key: config.cert.key,
    rejectUnauthorized: false,
    requireCertificate: false   
  }
});


server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());


server.get('/', function(req, res, next) {
  res.send('Welcome to Architeqt')
  return next();
})

server.get('/blueprint/:id', function (req, res, next) {
  qrs.getBlueprint(req.params.id).then(function(blueprint) {
    res.send(blueprint);
    return next();
  }, function(err) {
    res.send(err)
  }).done();
});

server.get('/blueprint/:id/children', function (req, res, next) {
  qrs.getBlueprint(req.params.id).then(function(blueprint) {
   qrs.getBlueprintChildren(req.params.id).then(function(children) {
     res.send([blueprint, children])
     return next();
   })
  })
  .catch(function(err) {
    console.log(err)
    return next();
  }).done();
});

server.post('/sync/full', function (req, res, next) {
  // Fetch all apps tagged as Blueprints from QMC
  qrs.getBlueprint().then(function(blueprints) {
    
    // Sequentially propogate each Blueprint
    return Promise.each(blueprints, function(blueprint) {
      
      // Fetch associated children
      return qrs.getBlueprintChildren(blueprint.id).then(function(children) {      
        var ids = children.map(function(d) { return d.id }, []);
        
        // Fetch blueprint definition
        return bp.getBlueprint(blueprint.id, config.engine).then(function(sketch) {
          return bp.applyTo(ids, sketch, config.engine) // Apply blueprint to associated children
        })
        
      })    
    })
          
  }).then(function() {
    res.send(200, 'success')
    return next()
  })
  .catch(function(err) {
    console.log(err)
    return next()
  }).done();
});

server.post('/sync/blueprint/:id', function(req, res, next) {
  if (!req.params.id) {
    res.send(400, 'missing blueprint id')
    return next();
  }
  
  qrs.getBlueprint(req.params.id).then(function(blueprints) {
    if(!blueprints.length) {
      res.send(404, 'No blueprint found')
      return next();
    }
    
    // Fetch associated children
    return qrs.getBlueprintChildren(req.params.id).then(function(children) {      
      var ids = children.map(function(d) { return d.id }, []);
      
      // Fetch blueprint definition
      return bp.getBlueprint(req.params.id, config.engine).then(function(sketch) {
        return bp.applyTo(ids, sketch, config.engine) // Apply blueprint to associated children
      })   
    
    })
  })
  .then(function() {
    res.send(200, 'success')
    return next();
  })
  .catch(function(error) {
    console.log(error)
  }).done();
  
})



server.listen(3001,function () {
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