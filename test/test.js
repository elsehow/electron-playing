'use strict'

var test = require('tape')
  , utils = require('./utils.js')
  , path = require('path')
  , fns = require('../app/lib/loadFiles.js')
  , pathTo = (f) => path.join(__dirname, f)
  , file = (p, f) => path.join(p, f)
  , Kefir = require('kefir')

// dir paths
var goodPath            = pathTo('/samples/good')
var goodPath2           = pathTo('/samples/good2')
var badPath             = pathTo('/samples')
var badSyntaxPath       = pathTo('/samples/bad-syntax')
// file paths
var goodOriginPath      = file(goodPath, 'origin.js')
var goodOriginPath2     = file(goodPath2, 'origin.js')
var badSyntaxOriginPath = file(badSyntaxPath, 'origin.js')

// setup for tests
utils.setupTests()

// unit tests ------------------------------------------------------------

test('_loadFiles(path) loads a directory', (t) => {
  t.plan(4)
  // good path is ok
  var files = fns._loadFiles(goodPath)
  files.onValue(files => {
    t.ok(files.originPath, 'good path should return originPath')
    t.ok(files.transformPath, 'good path should return transformPath')
    t.ok(files.endpointPath, 'good path should return endpointPath')
  })
  files.onError(err => {
    t.notOk(err, 'good path should return no error')
  })
  // bad path is not ok
  var files2 = fns._loadFiles(badPath)
  files2.onError(err => {
    t.ok(err, 'bad path produces error')
  })
  files2.onValue(v => {
    t.notOk(v, 'no value on a bad dir.')
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

// make a fake class to initialize
// has a fn and an update() method
// should initialize a class instance on path
class FakeClass {
  constructor (fn) {
    this.update(fn)
  }
  update (fn) {
    this._fn = fn
  }
}

test('_initializeAndWatch(initializer, path) works on initialization and file change', (t) => {
  t.plan(5)
  // setup test files
  utils.setupTests()
  // make a stream of components...
  var componentS = fns._initializeAndWatch(FakeClass, goodOriginPath)
  // getting fn from whatever path exports
  function testGoodInitialize (cb) {
    t.ok(componentS._dispatcher, 'should get a stream back.')
    function checkComponent (component) {
      t.deepEqual(component._fn.toString(), require(goodOriginPath).toString(), 'component._fn is what we\'d expect from path')
      componentS.offValue(checkComponent)
    }
    componentS.onValue(checkComponent)
    cb()
  }
  // when we change the file with which our component was made 
  // we should call update on the function.')
  function testGoodUpdate (cb) {
    function checkNewComponent (component) {
      t.ok(component, 'component ok')
      fns._uncache(goodOriginPath)
      var expectedFn = require(goodOriginPath)
      t.deepEqual(component._fn.toString(), expectedFn.toString(), 'component._fn is what we\'d expect from new path')
      componentS.offValue(checkNewComponent)
      cb()
    }
    componentS.onValue(checkNewComponent)
    // copy origin2 to origin1
    utils.copyFile(goodOriginPath2, goodOriginPath, () => {
      t.ok(true, 'copied file')
    })
  }
  testGoodInitialize(() =>
    testGoodUpdate(() => null))
      
})


test('_initializeAndWatch(initializer, path) emits errors on a bad path', (t) => {
  var componentS = fns._initializeAndWatch(FakeClass, badPath)
  componentS.onError((err) => {
    console.log('an error i expected to see:', err)
    t.ok(err, 'emits an error')
    t.end()
  })
  componentS.onValue((v) => {
    t.notOk(v, 'doesnt emit a value')
  })
})

test('_initializeAndWatch(initializer, path) emits errors on bad syntax', (t) => {
  var componentS = fns._initializeAndWatch(FakeClass, badSyntaxOriginPath)
  componentS.onError((err) => {
    console.log('an error i expected to see:', err)
    t.ok(err, 'emits an error')
    t.end()
  })
  componentS.onValue((v) => {
    t.notOk(v, 'doesnt emit a value')
  })
})


// integration tests -----------------------------------------------------------

test('wireComponents(dir) should set up components from a directory of origin.js, transform.js, endpoint.js, and return a stream of objects containing streams of components over time', (t) => {
  function handleErr (msg) {
    return (err) => {
      t.notOk(err, 'errors: ' + msg)
    }
  }
  //test with a good dir 
  var componentsS = fns.wireComponents(goodPath)
  componentsS.onValue((cs) => {
    // should see { originS, transformS, endpointS }
    t.ok(cs.originS, 'origin stream is ok')
    t.ok(cs.transformS, 'transform stream is ok')
    t.ok(cs.endpointS, 'endpoint stream is ok')
    cs.originS.onError(handleErr('origin'))
    cs.transformS.onError(handleErr('transform'))
    cs.endpointS.onError(handleErr('endpoint'))
    componentsS.onError(handleErr('components'))
    function doTest (ss) {
      // attach them all
      ss[0].attach(ss[1]).attach(ss[2])
      // assure that the're all tied up correctly
      t.deepEquals(ss[0]._downstream, ss[1], 'origin to transform')
      t.deepEquals(ss[1]._downstream, ss[2], 'transfrom to endpoint')
      components.offValue(doTest)
      t.end()
    }
    var components = Kefir
      .combine([cs.originS, cs.transformS, cs.endpointS])
    components
      .onValue(doTest)
  })
})

test('wireComponents(dir) should return a stream with an error if we pass a bad dir', (t) => {
  //test with a bad dir 
  var componentsS = fns.wireComponents(badPath)
  //should see an error
  fns.wireComponents(badPath).onValue(v =>
    t.notOk(v, 'should see no value'))
  fns.wireComponents(badPath).onError(err => {
    console.log('an error i want to see', err)
    t.ok(err, 'should see an error')
    t.end()
  })
})

test.skip('hierarchies should update as files change.')

test.skip('if a file has bad syntax, we should catch that.')

test('clean up', t => {
  fns.taredown() 
  t.end()
})
