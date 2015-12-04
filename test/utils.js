var fs = require('fs')
  , execSync = require('child_process').execSync

// copy stuff from tests/samples/templates into tests/samples/good
function setupTests () {
  execSync('cp test/samples/template/origin.js test/samples/good/origin.js')
}


function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
      done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
      done(err);
    });
    wr.on("close", function(ex) {
      done();
    });
    rd.pipe(wr);

    function done(err) {
      if (!cbCalled) {
        cb(err);
        cbCalled = true;
      }
  }
}


module.exports = {
  copyFile: copyFile,
  setupTests: setupTests,
}
