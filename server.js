var gen = require('./modules/generator/generator.js');

gen.getImage('./scripts', 'ubuntu11.10', "ami-a562a9cc", function(err, amiId) {
    if (err) {
        console.log(err);
    } else {
        console.log('ok, done - amiId = ' + amiId);
    }
});

