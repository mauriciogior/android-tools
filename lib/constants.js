
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
		IS_DEVICE : 'Waiting for device connection...',
		CANT_INIT : 'Failed to generate android-tools configuration file. Are you sure you are in a project directory?',
		NO_MANIFEST : 'No manifest file found.',
		CREATION_FAILED : 'Project creation failed!\nReason: ',
		PROJECT_CREATED : 'Projected created!'
	},
	QUESTION : {
		CREATE_ANDROID_PROJECT : 'Do you want to create a new Android project?',
		PACKAGE_NAME : 'What is the package name (eg com.example.app)?',
		ACTIVITY_NAME : 'What is the main activity name (eg MainActivity)?',
		TARGETS_AVAILABLE : 'Those are the following targets available:',
		TARGET : 'Which target do you want?'
	}
}

exports.get = function() {
	return Constants;
}