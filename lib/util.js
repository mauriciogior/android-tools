var fs          = require('fs')
    , readline  = require('readline');

var stderr  = process.stderr
    , stdin = process.stdin;

var Util = function() { }

Util.prototype = {

    ask : function(question, answers, callback) {

        var Ask = function(question, callback) {
            this.loop = false;
            this.question = question;
            this.questionToShow = question += ': ';
            this.answers = [];
            this.rl = readline.createInterface({
                input: stdin,
                output: stderr
            });
        }

        Ask.prototype = {

            run : function(callback) {
                var self = this;

                this.rl.question(this.questionToShow, function(answer) {
                    var err = (self.answers.indexOf(answer.toLowerCase()) == -1);

                    if(err && self.loop) {
                        stderr.write('Please provide a correct answer!\n');

                        self.run(callback);
                    } else {
                        callback(err, answer);
                    }
                });
            },

            withAnswers : function(answers) {
                answers = answers || [];

                this.questionToShow = this.question;

                if(answers.length > 0) {
                    this.questionToShow += ' [';

                    for(var i=0; i<answers.length; i++) {
                        if(answers[i] == '') continue;

                        this.questionToShow += answers[i];

                        if(i+1 < answers.length) {
                            this.questionToShow += '/';
                        }

                        answers[i] = answers[i].toLowerCase();
                    }

                    this.questionToShow += ']: ';
                } else {
                    this.questionToShow += ': ';
                }

                this.answers = answers;
                return this;
            },

            withLoop : function() {
                this.loop = true;
                return this;
            }

        }

        return new Ask(question, answers);

    }

}

exports.get = function() {
    return new Util;
}