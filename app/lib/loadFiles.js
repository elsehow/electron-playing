var path = require('path')
  , fs = require('fs')
  , _ = require('lodash')

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

// returns an object
// 
// {
//   originPath: path
//   transformPath: path
//   endpointPath: path
// }
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
  // if the file exists, add it to the return object
}

module.exports = loadFiles