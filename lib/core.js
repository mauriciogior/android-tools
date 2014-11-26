var shell   = require('shelljs')
    , async = require('async')
    , fs    = require('fs')
    , xml   = require('xml2js');

var Constants   = require('./constants.js').get()
    , Runnable  = require('./runnable.js').get()
    , Util      = require('./util.js').get();

var stderr = process.stderr;

var Core = function(instance, tools) {
    /**
     * {
     *      err : false,
     *      message : '',
     *      operation : 1,
     *      extra : '~/dev/app'
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
            case Constants.OPERATION.INIT:
                this.init();
                break;
            case Constants.OPERATION.BUILD:
                this.build(false);
                break;
            case Constants.OPERATION.RUN:
                this.build(true);
                break;
        }

    },

    init : function() {
        var parser = new xml.Parser();

        var path = this.instance.path;
        var buildFile = path + '/build.xml';
        var manifestFile = path + '/AndroidManifest.xml';
        var configFile = path + '/tools-config.json';
        var configFileContent = {};

        var manifest;

        var self = this;

        async.series([
            function(callback) {
                if(!fs.existsSync(manifestFile)) {  
                    stderr.write(Constants.MESSAGE.NO_MANIFEST + '\n');

                    Util
                    .ask(Constants.QUESTION.CREATE_ANDROID_PROJECT)
                    .withAnswers(['', 'Y', 'n'])
                    .withLoop()
                    .run(function(err, answer) {
                        // TODO
                        if(answer == 'y') {
                            self.newProject(callback);
                        } else {
                            callback(Constants.MESSAGE.CANT_INIT);
                        }
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                fs.readFile(manifestFile, function(err, data) {
                    manifest = data;

                    callback();
                });
            },
            function(callback) {
                parser.parseString(manifest, function (err, result) {

                    if(!err) {
                        manifest = Util.extractManifest(result);

                        callback();
                    } else {
                        callback(Constants.MESSAGE.NO_MANIFEST);
                    }

                });
            },
            function(callback) {
                configFileContent.name = 'replace-here';
                configFileContent.description = 'Replace here';
                configFileContent.package = manifest.package;
                configFileContent.version = '1.0.0';
                configFileContent.androidVersion = manifest.version;
                configFileContent.launchActivity = manifest.launchActivity;
                configFileContent.dependencies = {};

                configFileContent = JSON.stringify(configFileContent, null, 4);

                fs.writeFile(configFile, configFileContent, function(err) {
                    if(err) {
                        callback(Constants.MESSAGE.CREATION_FAILED + err);
                    } else {
                        callback();
                    }
                });
            }
        ], function(invalid) {
            if(invalid) {
                self.tools.die(invalid, Constants.SHELL.FAIL);
            }
            // TODO
            self.tools.die(Constants.MESSAGE.PROJECT_CREATED, Constants.SHELL.OK);
        });
    },

    newProject : function(callback) {

        var selectedPackage;
        var selectedActivityName;
        var selectedTarget;
        var targets;

        var self = this;

        async.series([
            function(callback) {
                Util
                .ask(Constants.QUESTION.PACKAGE_NAME)
                .withLoop()
                .run(function(err, answer) {
                    selectedPackage = answer;

                    callback();
                });
            },
            function(callback) {
                Util
                .ask(Constants.QUESTION.ACTIVITY_NAME)
                .withLoop()
                .run(function(err, answer) {
                    selectedActivityName = answer;

                    callback();
                });
            },
            function(callback) {
                self.runnable.run('android list targets -c', function(code, output) {
                    targets = output.split('\n');

                    callback();
                });
            },
            function(callback) {
                var question = Constants.QUESTION.TARGETS_AVAILABLE + '\n';
                var answers = [];

                for(var i=0; i<targets.length; i++) {
                    if(targets[i] == '') {
                        continue;
                    }

                    question += '['+i+']: ' + targets[i] + '\n';
                    answers.push('' + i);
                }

                stderr.write(question);

                Util
                .ask(Constants.QUESTION.TARGET)
                .withAnswers(answers)
                .withLoop()
                .run(function(err, answer) {
                    selectedTarget = targets[answer];

                    callback();
                });
            },
            function(callback) {
                var create = 'android create project';
                create += ' --activity ' + selectedActivityName;
                create += ' --package ' + selectedPackage;
                create += ' --target ' + selectedTarget;
                create += ' --path ./';

                self.runnable.run(create, function(code, output) {
                    if(code == Constants.SHELL.OK) {
                        stderr.write(Constants.MESSAGE.PROJECT_CREATED + '\n');

                        callback();
                    } else {
                        callback(Constants.MESSAGE.CREATION_FAILED + output);
                    }
                });
            }
        ], function(invalid) {
            if(invalid) {
                self.tools.die(invalid, Constants.SHELL.FAIL);
            }

            callback();
        });
    },

    build : function(run) {
        var path = this.instance.path;
        var buildFile = path + '/build.xml';

        if(!fs.existsSync(path)) {
            this.tools.die(Constants.MESSAGE.NO_PROJECT_FOUND, Constants.SHELL.FAIL)
        } else if(!fs.existsSync(buildFile)) {
            this.tools.die(Constants.MESSAGE.NO_BUILD_FILE, Constants.SHELL.FAIL)
        }

        var self = this;

        this.runnable.run('ant debug', function(code, output) {
            if(code == Constants.SHELL.OK) {
                if(run) {
                    console.log('Build finished!');
                    self.run(path);
                } else {
                    self.tools.die('Build finished!', Constants.SHELL.OK);
                }
            } else {
                self.tools.die('Build failed!\nReason: ' + output, Constants.SHELL.FAIL);
            }
        });
    },

    run : function(path) {

        var parser = new xml.Parser();
        var build;
        var manifest;
        var appPackage;
        var projectName;
        var launchActivity;

        var self = this;

        async.series([

            function(callback) {
                fs.readFile(path + '/build.xml', function(err, data) {
                    build = data;

                    callback();
                });
            },
            function(callback) {
                fs.readFile(path + '/AndroidManifest.xml', function(err, data) {
                    manifest = data;

                    callback();
                });
            },
            function(callback) {
                parser.parseString(build, function (err, result) {
                    projectName = result.project.$.name;

                    callback();
                });
            },
            function(callback) {
                parser.parseString(manifest, function (err, result) {
                    
                    var fail = false;

                    try {
                        appPackage = result.manifest.$.package;

                        for(var i = 0; i < result.manifest.application[0].activity.length; i++) {
                            if(result.manifest.application[0].activity[i]['intent-filter'] !== undefined
                            && result.manifest.application[0].activity[i]['intent-filter'][0].action !== undefined
                            && result.manifest.application[0].activity[i]['intent-filter'][0].action[0].$['android:name'] == 'android.intent.action.MAIN') {
                                launchActivity = result.manifest.application[0].activity[i].$['android:name'];

                                break;
                            }
                        }
                    } catch (e) {
                        callback(e);
                        fail = true;
                    }

                    if(!fail) {
                        if(!launchActivity) {
                            callback(Constants.MESSAGE.NO_ACTIVITY);
                        } else {
                            callback();
                        }
                    }
                });
            },
            function(callback) {
                var file = path + 'bin/' + projectName + '-debug.apk';

                self.runnable.setLongWaitMessage(Constants.MESSAGE.IS_DEVICE);

                self.runnable.run('adb install -r ' + file, function(code, output) {
                    if(code == Constants.SHELL.OK) {
                        console.log('Installation completed!')
                        callback();
                    } else {
                        callback('Installation failed!\nReason: ' + output);
                    }
                });
            },
            function(callback) {
                self.runnable.setWithOutput();
                self.runnable.run('adb shell am start -n ' + appPackage + '/' + launchActivity, function(code, output) {
                    if(code == Constants.SHELL.FAIL) {
                        callback('Execution failed!\nReason: ' + output);
                    }
                });

                if(self.instance.logcat) {
                    self.runnable.setWithOutput();

                    var command = "adb logcat | grep 'adb shell ps | grep " + appPackage + " | cut -c10-15'";

                    console.log('==LOGCAT==');
                    self.runnable.run(command, function(code, output) {
                        if(code == Constants.SHELL.FAIL) {
                            callback('Logcat failed!\nReason: ' + output);
                        }
                    });
                }
            }
        ], function(invalid) {
            if(invalid) {
                self.tools.die(invalid, Constants.SHELL.FAIL);
            } else {
                self.tools.die('Completed!', Constants.SHELL.OK);
            }
        });

    }

}

exports.get = function() {
    return Core;
}
