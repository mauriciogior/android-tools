var Constants = require('./constants.js').get();

exports.run = function(argv) {

	var result = {};

	result.err = false;
	result.message = '';

	if(argv.build != null) {
		result.operation = Constants.OPERATION.BUILD;
		result.extra = argv.build;
	} else {
		result.err = true;
		result.message = 'Give me something to do...';
	}

	return result;
}
