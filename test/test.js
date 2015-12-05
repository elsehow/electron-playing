'use strict'

var test = require('tape')
  , utils = require('./utils.js')
  , path = require('path')
  , fns = require('../app/lib/loadFiles.js')
  , pathTo = (f) => path.join(__dirname, f)
  , file = (p, f) => path.join(p, f)

// dir paths
var goodPath          = pathTo('/samples/good')
var goodPath2         = pathTo('/samples/good2')
var badPath           = pathTo('/samples')
// file paths
var goodOriginPath    = file(goodPath, 'origin.js')
var goodOriginPath2   = file(goodPath2, 'origin.js')

// setup for tests
utils.setupTests()

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
  // won't work with require:
  var fn1 = require(goodOriginPath)
  utils.copyFile(goodOriginPath2, goodOriginPath, () => { 
    var fn2 = require(goodOriginPath)
    t.deepEqual(fn1.toString(), fn2.toString(), 'without uncache, two functions imported w requrire are the same')
    // now let's try this with re-require
    // re-require a module
    var rfn1 = require(goodOriginPath)
    // modify that file
    utils.copyFile(goodOriginPath2, goodOriginPath, () => { 
      // uncache it
      fns._uncache(goodOriginPath)
      // re-require it again
      var rfn2 = require(goodOriginPath)
      // because req-require clears require cache, these should be different
      t.notDeepEqual(rfn1.toString(), rfn2.toString(), 'two functions, without _uncache, functions are indeed different')
      t.end()
    })
  })
})

test('_fnOnChange(path, fn, cb) will do cb on change', (t) => {
  utils.setupTests()
  fns._fnOnChange(goodOriginPath, path => {
    t.ok(true, 'cb was called')
    t.end()
  }, (err, watcher) => {
    t.notOk(err, 'setup correctly')
    t.ok(watcher, 'setup correctly')
    utils.copyFile(goodOriginPath2, goodOriginPath, () => null)
  })
})

test('_initializeAndWatch(initializer, path) works on initialization and file change', (t) => {
  // setup test files
  utils.setupTests()
  // make a fake class to initialize
  // has a fn and an update() method
  class FakeClass {
    constructor (fn) {
      this.update(fn)
    }
    update (fn) {
      this._fn = fn
    }
  }
  // make a stream of components...
  var componentS = fns._initializeAndWatch(FakeClass, goodOriginPath)
  // should initialize a class instance on path
  // getting fn from whatever path exports
  function testGoodInitialize (cb) {
    t.ok(componentS._dispatcher, 'should get a stream back.')
    function checkComponent (component) {
      t.deepEqual(component._fn.toString(), require(goodOriginPath).toString(), 'component._fn is what we\'d expect from path')
      componentS.offValue(checkComponent)
    }
    componentS.onValue(checkComponent)
  }
  // when we change the file with which our component was made 
  // we should call update on the function.')
  function testGoodUpdate () {
    function checkNewComponent (component) {
      t.ok(component, 'component ok')
      fns._uncache(goodOriginPath)
      var expectedFn = require(goodOriginPath)
      t.deepEqual(component._fn.toString(), expectedFn.toString(), 'component._fn is what we\'d expect from new path')
      componentS.offValue(checkNewComponent)
      t.end()
    }
    componentS.onValue(checkNewComponent)
    // copy origin2 to origin1
    utils.copyFile(goodOriginPath2, goodOriginPath, () => {
      t.ok(true, 'copied file')
    })
  }

  // TODO: error thru stream when `path` can't be required

  // TODO error thru stream when we update with some bad syntax file

  testGoodInitialize()
  testGoodUpdate()
})


test('wireComponents(dir, cb) should set up components from a directory of origin.js, transform.js, endpoint.js', (t) => {
  // test with a good dir we expect to see successCb from
  // should see { origin, transform, endpoint }
  // test with a bad dir we expect to see errorCb from
  // should see an error
  // successCb shouldn't fire
  t.end()
})


test('clean up', t => {
  fns.taredown() 
  t.end()
})