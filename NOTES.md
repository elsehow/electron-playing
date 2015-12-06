
this week -

## next moves

make an app with the new framework...

use a graph.....








last week -

abitof refactor + tests for this




two weeks ago -

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

