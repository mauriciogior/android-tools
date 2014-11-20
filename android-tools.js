#!/usr/bin/env node

var shell				= require('shelljs')
	, argumentParser 	= require('node-argument-parser');

var Constants 		= require('./lib/constants.js').get()
	, Core 			= require('./lib/core').get()
	, toolsCheck 	= require('./lib/tools-check')
	, argumentCheck = require('./lib/argument-check');

var AndroidTools = function() {};

AndroidTools.prototype = {

	/**
	 * Begins the execution of the tool.
	 * This function is a 'filter' to determine which operation to execute.
	 * After the definition, the Core will be called, providing a self reference.
	 */
	init : function() {

		var argv = argumentParser.parse(__dirname + '/argument.json', process);

		var hasTools = toolsCheck.run();

		if(hasTools.err) {
			this.die(hasTools.message, Constants.SHELL.FAIL);
		}

		var instance = argumentCheck.run(argv);

		if(instance.err) {
			this.die(instance.message, Constants.SHELL.FAIL);
		}

		var core = new Core(instance, this);
		core.start();
	},

	/**
	 * Finish the execution of the program with the given message.
	 * @param String message
	 */
	die : function(message, code) {
		console.log(message);

		shell.exit(code);
	}

};

new AndroidTools().init();
