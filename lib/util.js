var fs          = require('fs')
    , readline  = require('readline');

var stderr  = process.stderr
    , stdin = process.stdin;

var rl = readline.createInterface({
    input: stdin,
    output: stderr
});

var Util = function() { }

Util.prototype = {

    ask : function(question, answers, callback) {

        var Ask = function(question, callback) {
            this.loop = false;
            this.question = question;
            this.questionToShow = question += ': ';
            this.answers = [];
            this.defAnswer;
        }

        Ask.prototype = {

            run : function(callback) {
                var self = this;

                rl.question(this.questionToShow, function(answer) {
                    if(self.answers.length > 0) {
                        var err = (self.answers.indexOf(answer.toLowerCase()) == -1);
                    } else {
                        var err = (answer == '');
                    }

                    if(err && self.loop) {
                        stderr.write('Please provide a correct answer!\n');

                        self.run(callback);
                    } else {
                        if(answer == '') {
                            answer = self.defAnswer || '';
                        }
                        
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
                        if(answers[i] == answers[i].toUpperCase()) {
                            this.defAnswer = answers[i].toLowerCase();
                        }

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
