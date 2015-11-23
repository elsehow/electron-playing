## next move

setup a test script (like in notes) and imagine what SHOULD happen

find the problems with that test script, and solve those too

## questions

.

- why not live-reload setup AND process streams?

.- how does user setup streams?

.- what's the API for passing stuff to be rendered?

.- how do views work?

- how do we check/validate that API in the renderer process?

- whats the vocabulary for user input? "scripts"? "programs"? 
i say programs but we

- whats a good tutorial / intro for the doxx and instructable ?


## answers ?

- why not live-reload setup AND process streams?

how would this work?

sounds like a hacked version of simple-charm

- how does user setup streams?

    // setup.js
    var port = serial('/dev/tty.MindWave')
    var = serial('/dev/tty.MindWave')
    return [port,  'data']

    // multiple streams
    return [ [port, 'data']
             [socket, 'mindwave'] ]

- what's the API for passing stuff to be rendered?

    // my-program.js
    module.exports = function (stream) {
      // do stuff to stream
      return charm.views.Spectrogram(stream) 
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

decisions

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