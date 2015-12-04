var test = require('tape')
  , path = require('path')
  , loadFiles = require('../../app/lib/loadFiles.js')

var goodPath =  __dirname + '/samples/good'
var badPath  =  __dirname + '/samples'

test('loads a directory', (t) => {
  // good path is ok
  loadFiles(goodPath, (err, files) => {
    t.notOk(err, 'good path should return no error')
    t.ok(files.originPath, 'good path should return originPath')
    t.ok(files.transformPath, 'good path should return transformPath')
    t.ok(files.endpointPath, 'good path should return endpointPath')
  })
  // bad path is not ok
  loadFiles(badPath, (err, files) => {
    t.ok(err, 'bad path should return an error')
    t.notOk(files, 'bad path should return no files')
    t.end()
  })
})
