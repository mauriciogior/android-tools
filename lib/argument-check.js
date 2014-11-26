var Constants = require('./constants.js').get();

var stream = process.stderr;

/**
 * Verifies if user gave the following main parameter.
 * @param argv argv created by minimist
 * @param param string to check
 * @return boolean
 */
function has(argv, param) {
    return argv._.indexOf(param) != -1;
}

function help() {
    return '\
usage: android-tools [init, build, run] \n\
optional parameters: \n\
    run [--logcat]\n\n\
examples:\n\
    android-tools init\n\
    android-tools build\n\
    android-tools run --logcat';
}

exports.run = function(argv) {

    var result = {};

    result.err = false;
    result.message = '';

    if(has(argv, 'init')) {
        result.operation = Constants.OPERATION.INIT;
    } else if(has(argv, 'build')) {
        result.operation = Constants.OPERATION.BUILD;
    } else if(has(argv, 'run')) {
        result.operation = Constants.OPERATION.RUN;
    } else {
        result.err = true;
        result.message = help();
    }

    result.path = argv.path || './';
    result.logcat = argv.logcat;

    return result;

}
