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
}

Runnable.prototype = {

	start : function() {
		var self = this;

		this.loading = setInterval(function() {
			self.stream.clearLine();
			self.stream.write(self.pieces[self.index++]);
			self.stream.cursorTo(0);

			if(self.index > 3) {
				self.index = 0;
			}
		}, 150);
	},

	run : function(command, callback) {

		this.start();

		var self = this;

		shell.exec(command, { silent : true }, function(code, output) {
			self.finish();

			callback(code, output);
		});

	},

	finish : function() {
		this.stream.clearLine();
		clearInterval(this.loading);
	}

}

exports.get = function() {
	return Runnable;
}
