var shell = require('shelljs');

var TOOLS = [
	{
		tool : 'adb',
		message : 'Please fix the Android Debug Bridge (adb) path.'
	},
	{
		tool : 'ant',
		message : 'Please fix the Apache Ant (ant) path.'
	},
	{
		tool : 'android',
		message : 'Please fix the Android (android) path.'
	}
]

exports.run = function() {

	var result = {};

	result.err = false;
	result.message = '';

	for(var i = 0; i < TOOLS.length; i++) {
		if(!shell.which(TOOLS[i].tool)) {
			result.err = true;
			result.message += TOOLS[i].message;

			if(i + 1 < TOOLS.length) {
				result.message += '\n';
			}
		}
	}

	return result;
}
