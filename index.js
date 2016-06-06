process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();

var restify = require('restify');
var Promise = require('bluebird');
var Logger = require('bunyan');
var path = require('path')

var config = require('./config');
var bp = require('./lib/blueprint');
var qrs = require('./lib/qrs-interactions')

var log = new Logger({
  name: 'architeqt',
  streams: [
    {
      type: 'rotating-file',
      path: path.resolve(__dirname, 'architeqt.log'),
      level: 'info',
      period: '1d',
      count: 3
    }
  ],
  serializers: restify.bunyan.serializers
});

var server;
if (config.rest.useHTTPS) {
  server = restify.createServer({
    name: 'architeqt',
    version: '1.0.0',
    log: log,
    httpsServerOptions: {
      ca: [config.cert.ca],
      cert: config.cert.server_cert,
      key: config.cert.server_key,
      rejectUnauthorized: false,
      requireCertificate: false
    }
  })
} else {
  server = restify.createServer({
    name: 'architeqt',
    version: '1.0.0',
    log: log
  });
};

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.requestLogger());


if (config.rest.restrictCrossOrigin) {
  server.use(
    function crossOrigin(req, res, next) {
      res.header("Access-Control-Allow-Origin", config.rest.crossOriginHost);
      res.header("Access-Control-Allow-Headers", "X-Requested-With");
      return next();
    }
  )
}

server.pre(function (request, response, next) {
  request.log.info({ req: request }, 'start');
  return next();
});

server.on('after', function (req, res, route) {
  req.log.info({ res: res }, "finished");
});

if (config.rest.hostClientUI) {
  server.get(/\/architeqt-client\/?.*/, restify.serveStatic({
    directory: __dirname
  }));
}
server.get('/', function (req, res, next) {
  res.send('Welcome to Architeqt')
  return next();
})

server.get('/blueprint/:id', function (req, res, next) {
  qrs.getBlueprint(req.params.id).then(function (blueprint) {
    res.send(blueprint);
    return next();
  }).catch(function (error) {
    log.error({ err: error }, ' error in /blueprint/:id ');
    res.send(500, error)
    return next();
  }).done();
});

server.get('/blueprint/:id/children', function (req, res, next) {
  qrs.getBlueprint(req.params.id).then(function (blueprint) {
    qrs.getBlueprintChildren(req.params.id).then(function (children) {
      res.send(200, children)
      return next();
    })
  })
    .catch(function (error) {
      log.error({ err: error }, ' error in /blueprint/:id/children ');
      res.send(500, error)
      return next();
    }).done();
});

server.post('/sync/full', function (req, res, next) {

  // This could take a while, disable standard 2min timeout
  res.connection.setTimeout(0);

  // Fetch all apps tagged as Blueprints from QMC
  qrs.getBlueprint().then(function (blueprints) {

    // Sequentially propogate each Blueprint
    // A little bit slower but ensures we don't update the same child at the same time from multiple blueprints
    return Promise.each(blueprints, function (blueprint) {

      // Fetch associated children
      return qrs.getBlueprintChildren(blueprint.id).then(function (children) {
        var ids = children.map(function (d) { return d.id }, []);

        // Fetch blueprint definition
        return bp.getBlueprint(blueprint.id, config.engine).then(function (sketch) {
          return bp.applyTo(ids, sketch, config.engine) // Apply blueprint to associated children
        })

      })
    })

  }).then(function () {
    res.send(200, 'success');
    return next()
  })
    .catch(function (error) {
      console.log(error);
      log.error({ err: error }, ' error in /sync/full ');
      res.send(500, error)
      return next();
    }).done();
});

server.post('/sync/blueprint/:id', function (req, res, next) {
  if (!req.params.id) {
    res.send(400, 'missing blueprint id')
    return next();
  }

  qrs.getBlueprint(req.params.id).then(function (blueprints) {
    if (!blueprints.length) {
      res.send(404, 'No blueprint found')
      return next();
    }

    // Fetch associated children
    return qrs.getBlueprintChildren(req.params.id).then(function (children) {
      var ids = children.map(function (d) { return d.id }, []);
      // Fetch blueprint definition
      return bp.getBlueprint(req.params.id, config.engine).then(function (sketch) {
        return bp.applyTo(ids, sketch, config.engine) // Apply blueprint to associated children
      })

    })
  })
    .then(function () {
      res.send(200, 'success')
      return next();
    })
    .catch(function (error) {
      log.error({ err: error }, ' error in /sync/blueprint/:id ');
      res.send(500, error)
      return next();
    }).done();

});

server.post('/sync/child/:id', function (req, res, next) {
  if (!req.params.id) {
    res.send(400, 'missing child id')
    return next();
  }

  qrs.getBlueprintChildren().then(function (children) {
    var child = children.filter(function (d) { return req.params.id === d.id });

    if (!child.length) {
      res.send(400, 'App is not using blueprints')
      return next();
    }

    // Filter list of custom properties and flatten array into blueprint ids
    var usedBlueprints = child[0].customProperties.filter(function (d) {
      return d.definition.name === config.qmc.childAppProp;
    }).map(function (d) {
      return d.value;
    }, []);

    // For each assigned blueprint, apply.
    return Promise.each(usedBlueprints, function (d) {
      return bp.getBlueprint(d, config.engine).then(function (sketch) {
        return bp.applyTo([req.params.id], sketch, config.engine) // Apply blueprint to child
      })
    })

  }).then(function () {
    res.send(200, 'success')
    return next();
  })
    .catch(function (error) {
      log.error({ err: error }, ' error in /sync/child/:id ');
      res.send(500, error)
      return next();
    }).done();
})

server.post('/child/:childId/remove', function (req, res, next) {
  if (!req.params.childId) {
    res.send(400, 'missing child id')
    return next();
  };
  if (!req.params.blueprintIds) {
    res.send(400, 'missing blueprint ids')
    return next();
  };

  // Make sure it's an array and not a string.
  var blueprintIds = req.params.blueprintIds;
  if (typeof req.params.blueprintIds === 'string') {
    blueprintIds = [req.params.blueprintIds]
  }

  Promise.each(blueprintIds, function (d) {
    return bp.removeItemsFromChild(req.params.childId, d, config.engine)
      .then(function () {
        return qrs.removeChildFromBlueprint(req.params.childId, d)
      })
  })
    .then(function (reply) {
      res.send(200, 'success');
      return next();
    })
    .catch(function (error) {
      log.error({ err: error }, ' /child/:childId/remove');
      res.send(500, error)
      return next();
    })

});

server.get('/child/full', function (req, res, next) {
  return qrs.getBlueprintChildren()
    .then(function (reply) {
      res.send(200, reply);
      return next();
    })
    .catch(function (error) {
      log.error({ err: error }, ' /child/full');
      res.send(500, error)
      return next();
    })
});

server.get('/child/:id/blueprints', function (req, res, next) {
  if (!req.params.id) {
    res.send(400, 'missing blueprint id')
    return next();
  };

  return qrs.getBlueprintsForChild(req.params.id)
    .then(function (reply) {
      res.send(200, reply);
      return next();
    })
    .catch(function (error) {
      log.error({ err: error }, ' /child/:childId/remove/:id');
      res.send(500, error)
      return next();
    })
});

server.get('/apps', function (req, res, next) {
  qrs.getNonBlueprints()
    .then(function (reply) {
      res.send(200, reply);
      return next();
    })
    .catch(function (error) {
      log.error({ err: error }, '/apps');
      res.send(500, error)
      return next();
    })
});

server.listen(config.rest.port, function () {
  log.info({ addr: server.address() }, 'listening');
});