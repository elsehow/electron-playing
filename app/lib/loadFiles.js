var path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , Gaze = require('gaze')
  , Kefir = require('kefir')
  , check = require('syntax-error')
  , abitof = require('a-bit-of')
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
  var c; 

  // make a stream of component errors
  var componentErrorStream = Kefir.stream((emitter) => {
    c = new ComponentInitializer((err) => {
      emitter.error(err)
    })
  })

  // make a stream of components over tiem
  var componentStream = fileChangeS(path)
    .flatMap((path) => {
      return Kefir.fromNodeCallback((cb) => {
        idempotentRequireIfSyntaxOk(path, cb)
      })
    })
    .map((fn) => {
      c.update(fn)
      return c
    })

    // merge this stream with the stream of errors
    return Kefir.merge([componentStream, componentErrorStream])
}

// this is the public fn of this module
// it takes a dir with files
// origin.js, transform.js, endpoint.js
// makes components of them, attaches them together,
// and returns a stream of:
//
//    {
//      originS        // stream of origin components
//      transformS     // stream of transform components
//      endpointS      // ...
//    }
//
// (yes, it returns a stream of streams)
//
function wireComponents (dir) {
  return Kefir.fromNodeCallback((cb) => {
    loadFiles(dir, cb)
  }).map((paths) => {
    // set up components
    return {
      originS:      initializeAndWatch(abitof.Origin, paths.originPath),
      transformS:   initializeAndWatch(abitof.Transform, paths.transformPath),
      endpointS:    initializeAndWatch(abitof.Endpoint, paths.endpointPath),
    }
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
