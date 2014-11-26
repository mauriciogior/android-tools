Android Tools
=============

Node.JS application to help with Android development.

## Getting started

You need to have both `nodejs` and `npm` installed on your computer.

To install **Android Tools** you need to execute the following command:

```shell
npm install android-tools -g
```

*Please note that this repository is not published on `npm` yet, so you need to clone this repository and, instead of running `npm install android-tools -g`, you should run `npm install . -g` on the root directory of this repository.*

## How it works

This tool has the following dependencies:

+ adb
+ ant
+ android

Both `adb` and `android` are available inside the Android SDK folder under `platform-tools` and `tools` respectively. The `ant` tool usually cames with the JRE. If you don't have it, you must install it.

You should be able to run all of those tools directly on your shell, so you need to set the right path on your `.bash_profile`:

```shell
ln -s /path/to/sdk/tools/android /path/to/sdk/platform-tools
echo "export PATH=$PATH:$HOME/path/to/sdk/platform-tools" >> ~/.bash_profile
```

This should do the trick.

Want to test it?

To create a new Android project (or configure an existing one), run:

```shell
android-tools init
```

To build an app, go to the application directory and run:

```shell
android-tools build
```

To run an app, go to the application directory and run:

```shell
android-tools run
```

## Ok, but how it works?

On the current version, it basically uses the `ant` to generate a *debug signed* apk file and the `adb` to install on the device and display the runtime log using adb's `logcat`.

## In which stage is it?

The application can only build, install, execute and log the application. It is on its early stages, so you shouldn't use it on your daily development.

If you need more help, you can always execute `android-tools --help`.

```shell
usage: android-tools [init, build, run] 
optional parameters: 
    run [--logcat]

examples:
    android-tools init
    android-tools build
    android-tools run --logcat
```

## Colaboration

If you are interested on this project, please send me an email or just simply fork it and make a pull request.

My email is `mauricio.c.giordano@gmail.com`
