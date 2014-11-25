
var Constants = {
	OPERATION : {
		INIT : 0,
		BUILD : 1,
		RUN : 2
	},
	SHELL : {
		OK : 0,
		FAIL : 1
	},
	MESSAGE : {
		NO_PROJECT_FOUND : 'Build failed!\nReason: no project found on this directory.\n\nTip: try creating a new project with "android-project --new PROJECT_NAME".',
		NO_BUILD_FILE : 'Build failed!\nReason: no build file found. Are you in the right directory?\n\nTip: try creating a new project with "android-project --new PROJECT_NAME".',
		NO_ACTIVITY : 'Run failed!\nReason: couldn\'t find the MAIN Activity.',
		IS_DEVICE : 'Waiting for device connection...'
	},
	QUESTION : {
		CREATE_ANDROID_PROJECT : 'Do you want to create a new Android project?'
	}
}

exports.get = function() {
	return Constants;
}