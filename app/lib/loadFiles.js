var path = require('path')
  , fs = require('fs')
  , _ = require('lodash')
  , Gaze = require('gaze')
  , check = require('syntax-error')
  , gazers = []

// asynchronously check if all `files` exist
function filesExist (files, cb) {
  var err = null
  var filesDoExist = _.reduce(files, 
    (acc, f) => {
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
  )
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

function callbackOnChange (path, cb) {
  var gaze = new Gaze(path)
  gazers.push(gaze)
  gaze.on('changed', cb)
}

function pathIfSyntaxOk (path, errCb) {
  var err = check(path, path)
  if (err) {
    errCb(err)
    return
  }
  return path
}

function functionIfSyntaxOk (path, errCb) {
  uncache(path)
  return require(pathIfSyntaxOk(path, errCb))
}

// untested
function initializeAndWatch (initializer, path) {
  var c = new initializer(path)
  callbackOnChange(path, () => {
    var fn = functionIfSyntaxOk(path)
    if (fn)
      c.update(fn)
  })
}


module.exports = { 
  // private
  _loadFiles: loadFiles,
  _uncache: uncache,
  _callbackOnChange: callbackOnChange,
  // public
  gazers: gazers,
  initializeAndWatch: initializeAndWatch
}
