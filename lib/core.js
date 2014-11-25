var shell   = require('shelljs')
    , async = require('async')
    , fs    = require('fs')
    , xml   = require('xml2js');

var Constants   = require('./constants.js').get()
    , Runnable  = require('./runnable.js').get()
    , Util      = require('./util.js').get();

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
        var path = this.instance.path;
        var buildFile = path + '/build.xml';
        var manifestFile = path + '/AndroidManifest.xml';

        var self = this;
        
        async.series([
            function(callback) {
                if(!fs.existsSync(manifestFile)) {  
                    Util
                    .ask(Constants.QUESTION.CREATE_ANDROID_PROJECT)
                    .withAnswers(['', 'y', 'N'])
                    .withLoop()
                    .run(function(err, answer) {
                        // TODO
                        callback();
                    });
                } else {
                    callback();
                }
            }
        ], function(invalid) {
            // TODO
            self.tools.die('TODO', Constants.SHELL.FAIL);
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
