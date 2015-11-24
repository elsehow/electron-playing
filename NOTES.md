## next moves

think: how do we import `spectral-charms` when we're sitting writing scripts?

       where is this maintained?  (use existing elsehow/spectral-charmer)

       whats its relationship to spectral-charmer? (just an API)

      now, what might happen here is:

      - a-bit-of has no kefir anymore

      - wow api just got simpler and so did readme

      - spectral-charms is its own thing - a starting point for writing plugins



make: nice loading screen in html

      recent files persist


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

## decisions

renderer process responsible for simple-charming stuff


## notes

.

patches:
  - bufftojson
  - rate


```javascript

function setup () {
  var port = serial('/dev/tty.MindWave')
  return [ port, 'data' ]
}

function process (stream)  {
  var ffts = stream.map(buffToList).map(fft)
  return views.Spectrograph(ffts, 'my data')
}


module.exports = {
  setup: setup,
  process: process
}

```

looks good to me...
