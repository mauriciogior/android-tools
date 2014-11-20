var Constants = require('./constants.js').get();

exports.run = function(argv) {

	var result = {};

	result.err = false;
	result.message = '';

	if(argv.build) {
		result.operation = Constants.OPERATION.BUILD;
	} else if(argv.run) {
		result.operation = Constants.OPERATION.RUN;
	} else {
		result.err = true;
		result.message = 'Give me something to do...';
	}

	if(argv.logcat) {
		result.logcat = true;
	}

	return result;
}
