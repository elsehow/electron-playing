var test = require('tape')
  , utils = require('./utils.js')
  , path = require('path')
  , fns = require('../app/lib/loadFiles.js')
  , pathTo = (f) => path.join(__dirname, f)

var goodPath =  pathTo('/samples/good')
var badPath  =  pathTo('/samples')

test('_loadFiles(path) loads a directory', (t) => {
  // good path is ok
  fns._loadFiles(goodPath, (err, files) => {
    t.notOk(err, 'good path should return no error')
    t.ok(files.originPath, 'good path should return originPath')
    t.ok(files.transformPath, 'good path should return transformPath')
    t.ok(files.endpointPath, 'good path should return endpointPath')
  })
  // bad path is not ok
  fns._loadFiles(badPath, (err, files) => {
    t.ok(err, 'bad path should return an error')
    t.notOk(files, 'bad path should return no files')
    t.end()
  })
})

test('_uncache(path) will allow us to re-require a file without cacheing it', (t) => {
  utils.setupTests()
  var mod1 = pathTo('samples/good/origin.js')
  var mod2 = pathTo('samples/good2/origin.js')
  // won't work with require:
  var fn1 = require(mod1)
  utils.copyFile(mod2, mod1, () => { 
    fn2 = require(mod1)
    t.deepEqual(fn1.toString(), fn2.toString(), 'without uncache, two functions imported w requrire are the same')
    // now let's try this with re-require
    // re-require a module
    var rfn1 = require(mod1)
    // modify that file
    utils.copyFile(mod2, mod1, () => { 
      // uncache it
      fns._uncache(mod1)
      // re-require it again
      var rfn2 = require(mod1)
      // because req-require clears require cache, these should be different
      t.notDeepEqual(rfn1.toString(), rfn2.toString(), 'two functions are indeed different')
      t.end()
    })
  })
})

test('_callbackOnChange(path, cb) will do cb on change', (t) => {
  utils.setupTests()
  var mod1 = pathTo('samples/good/origin.js')
  var mod2 = pathTo('samples/good2/origin.js')
  fns._callbackOnChange(mod1, path => {
    t.ok(true, 'cb was called')
    t.end()
  })
  utils.copyFile(mod2, mod1, () => null)
})


test('clean up', t => {
  fns.gazers.forEach(g => g.close())
  t.end()
})