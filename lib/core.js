var shell 	= require('shelljs')
	, fs 	= require('fs');

var Constants = require('./constants.js').get()
	, Runnable = require('./runnable.js').get();

var Core = function(instance, tools) {
	/**
	 * {
	 * 		err : false,
	 * 		message : '',
	 * 		operation : 1,
	 * 		extra : '~/dev/app'
	 * }
	 */
	this.instance = instance;

	/**
	 * Instance of AndroidTools.
	 */
	this.tools = tools;

	this.runnable = new Runnable();
}

Core.prototype = {

	start : function() {
		switch(this.instance.operation) {
			case Constants.OPERATION.BUILD:
				this.build(this.instance.extra);
				break;
		}
	},

	run : function(command, callback) {

		shell.exec(command, { silent : true }, function(code, output) {
			callback(code, output);
		});

	},

	build : function(path) {

		var buildFile = path + '/build.xml';

		if(!fs.existsSync(path)) {
			this.tools.die('Build failed!\nReason: path not found.')
		} else if(!fs.existsSync(buildFile)) {
			this.tools.die('Build failed!\nReason: build file not found.')
		}

		var self = this;

		this.runnable.run('ant -buildfile ' + buildFile, function(code, output) {
			if(code == Constants.SHELL.OK) {
				self.tools.die('Build finished!\nDo you wish to see the And log? (y/N): ');
			} else {
				self.tools.die('Build failed!\nReason: ' + output);
			}
		});
	}

}

exports.get = function() {
	return Core;
}
