var shell 	= require('shelljs')
	, fs 	= require('fs');

var Constants = require('./constants.js').get();

var Runnable = function() {
	this.stream = process.stderr;
	this.loading;
	this.index = 0;

	this.pieces = [
		'- Loading.',
		'\\ Loading..',
		'| Loading...',
		'/ Loading....'
	];

	this.longWaitMessage = false;
	this.timeSpent = 0;
	this.silent = true;
}

Runnable.prototype = {

	start : function() {
		var self = this;

		this.loading = setInterval(function() {
			if(self.longWaitMessage && self.timeSpent % 25 == 0) {
				self.stream.clearLine();
				self.stream.write(self.longWaitMessage + '\n');
			}

			self.stream.clearLine();
			self.stream.write(self.pieces[self.index++]);
			self.stream.cursorTo(0);

			if(self.index > 3) {
				self.index = 0;
			}

			self.timeSpent += 1;
		}, 150);
	},

	setWithOutput : function() {
		this.silent = false;
	},

	setLongWaitMessage : function(message) {
		this.longWaitMessage = message;
	},

	run : function(command, callback) {

		if(this.silent) {
			this.start();
		}

		var self = this;

		shell.exec(command, { silent : this.silent }, function(code, output) {
			
			if(self.silent) {
				self.finish();
			}

			self.silent = true;

			callback(code, output);
		});

	},

	finish : function() {
		this.stream.clearLine();
		this.setLongWaitMessage(false);
		this.timeSpent = 0;
		clearInterval(this.loading);
	}

}

exports.get = function() {
	return Runnable;
}
