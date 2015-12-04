
```javascript
loadDir(dir, (err, res) => {
  // handle error
  if (err) {
    emitError(err)
    return
  }
  // set up components
  origin    = makeAndWatch(Origin, res.orginPath)
  transform = makeAndWatch(Transform, res.transformPath)
  endpoint  = makeAndWatch(Endpoint, res.endpointPath) 
  // wire em up
  origin.attach(transform).attach(endpoint)
})

// this function will initialize `initializer`
// using a function exposed via `require(path`
// if the file at `path` changes, it'll magically re-require it
// checking its syntax
// and emitting any errors over `emitError`
makeAndWatch(initializer, path) {
  // handle syntax errors
  function pathIfSyntaxOk () {
    return checkSyntax(path, emitError))
  }
  function functionIfSyntaxOk () {
    _uncache(path)
    return require(pathIfSyntaxOk())
  }
  watch(path).on('change', () => {
    // TODO: c.update(path, emitError)
    c.update(functionIfSyntaxOk)
  })
  return c
}
```



stil outstanding (but not my problem here):
- validation + erroring in charmer
i say, take an error callback....










last week -

## next moves

spend some time experimenting with views

see what works see whats nice

see whats being written and where

and who needs to worry about it

## questions

.

.

.- how does user setup streams?

- what's the API for passing stuff to be rendered?

.- how do views work?

- WHERE/HOW ARE ERRORS DISPLAYED???

- how do we check/validate script conventions?

- whats the vocabulary for user input? "scripts"? "programs"? 
i say SKETCH but we

- whats a good tutorial / intro for the doxx and instructable ?


## answers ?

- how does user setup streams?

this is up to our new dependency, a-bit-of

whats important is the pluggability!

- what's the API for passing stuff to be rendered?

    // my-program.js
    module.exports = function (stream) {
      // do stuff to stream
      return [
        charm.views.Spectrogram(stream) 
      ]
    }

or multiple streams

    // my-program.js
    module.exports = function (stream1, stream2) {
      // do stuff to stream
      return [
        views.Spectrogram(stream1),
        views.Histogram(stream2),
      ]
    }

- how do views work?

they are a stream of hdom
    
    module.exports = function (stream, args...) {

      var hdom = stream.map(function (v) {
        return h('div', ..
      })

      return hdom
    }

**PROBLEMS WITH THIS ANSWER**

how do we setup stuff like three.js? like rickshaw or d3?

- why not live-reload setup AND process streams?

well, it was confusing

besides, user's not going to be quite sure what will happen. DID i change setup()?

(ironically, v8 would be confused about the same thing. implementing this would take some crazy static code analysis, i think.)

## wish listing

make: a rest button to reload your current script, in charm
      kind of a frame for your charms

make: a nice welcome screen in html
      select recent files
      or open a new one

make: a new project generator!
      like p5 has.
      with npm stuff pre-bundled..

