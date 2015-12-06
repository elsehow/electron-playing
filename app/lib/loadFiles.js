var path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , Gaze = require('gaze')
  , Kefir = require('kefir')
  , check = require('syntax-error')
  // list of processes that watch for file changes. 
  // package "gaze" on npm
  , gazers = []

// asynchronously check if all `files` exist
function filesExist (files, cb) {
  var err = null
  // a reduce fn
  function checkFiles (acc, f) {
    if (acc) {
      try {
        return fs.lstatSync(f)
      } catch (e) {
        err = e
        return false
      }
    }
    return false
  }
  var filesDoExist = _.reduce(files, checkFiles)
  cb(err, filesDoExist)
}

// calls cb on an object
// 
// {
//   originPath: path
//   transformPath: path
//   endpointPath: path
// }
//
function loadFiles (dir, cb) {
  var files = {
    originPath: 'origin.js',
    transformPath: 'transform.js',
    endpointPath: 'endpoint.js',
  }
  // make a list of paths we expect to see
  var paths = _.mapValues(files, f => path.join(dir, f))
  // see if all the files we expect to see do, in fact, exist
  filesExist(paths, (err, res) => {
    if (res)
      cb(null, paths)
    else
      cb(err, null)
  })
}

function uncache (moduleName) {
  delete require.cache[moduleName]
}

// a stream that pushes the path every time the file changes
function fileChangeS (path) {
  return Kefir.stream((emitter) => {
    var gaze = new Gaze(path, (err, watcher) => {
      if (err) 
        emitter.error(err) 
      else
        emitter.emit(path)
    })
    gazers.push(gaze)
    gaze.on('changed', () => {
      emitter.emit(path)
    })
  })
}


// returns a fn from a path
// removes path from require cache 
// checks file's syntax as well
// takes cb(err, res)
// returns null
function idempotentRequireIfSyntaxOk (path, cb) {
  // returns `path` if (js) syntax of the file at `path` is ok
  fs.readFile(path, (err, src) => {
    if (err) {
      cb(err, null)
      return
    }
    var err = check(src, path)
    if (err) {
      cb(err, null)
      return
    }
    // idempotently require the file
    // try to require it
    try {
      uncache(path)
      var x = require(path, cb)
      cb(null, x)
      return
    } catch (err) {
      cb(err, null)
      return
    }
  })
  return
}

// initializes a component initializer with `path` as its initialization arguments
// assumes component takes a fn, and has an update() method
//
// calls cb(null, componentStream)
// where stream is a stream of components over time
//
function initializeAndWatch (ComponentInitializer, path) {
  // make a component on the fn
  var c = new ComponentInitializer()

 return fileChangeS(path)
    .flatMap((path) => {
      return Kefir.fromNodeCallback((cb) => {
        idempotentRequireIfSyntaxOk(path, cb)
      })
    })
    .map((fn) => {
      c.update(fn)
      return c
    })
}

// this is the public fn of this module
// it takes a dir with files
// origin.js, transform.js, endpoint.js
// makes components of them, attaches them together,
// and calls cb on:
//   
//    cb(err, components)
// 
// where components is an object of streams:
//
//    {
//      originS        // stream of origin components
//      transformS     // stream of transform components
//      endpointS      // ...
//    }
// 
//
function wireComponents (dir, cb) {
  // load given dir
  loadDir(dir, (err, res) => {
    // on err, return null
    if (err) {
      cb(err, null)
      return
    }
    // set up components
    var originS       = initializeAndWatch(Origin, res.orginPath)
    var transformS    = initializeAndWatch(Transform, res.transformPath)
    var endpointS     = initializeAndWatch(Endpoint, res.endpointPath) 
    // combine streams (all are async, we dont know in what order they'll come in)
    Kefir.combine([originS, trasnformS, endpointS], (o, t, e) => {
      // wire up components
      origin
        .attach(transform)
        .attach(endpoint)
      // return an obj with the components
      cb(null, {
        originS: originS,
        transformS: transformS,
        endpointS: endpointS,
      })
    })
  }) 
}

// synchronous taredown function
function taredown () {
  gazers.forEach(g => g.close())
  return
}


module.exports = { 
  // private
  _loadFiles: loadFiles,
  _uncache: uncache,
  _gazers: gazers, 
  _initializeAndWatch: initializeAndWatch,
  // public
  wireComponents: wireComponents,
  taredown: taredown,
}
