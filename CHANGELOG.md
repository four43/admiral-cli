# v0.11.1

* Tweaked ignore for .npmignore (just use .gitignore)
* Added test for nesting Commands with CommandGroups

# v0.11.0

**BREAKING CHANGES**

* Modified Changed signature of callbacks for Commands again. `cli` is in scope, don't send that back.
* Added Command.subElements, to help build out trees of commands.
* Updated README to reflect changes.

# v0.10.0

**BREAKING CHANGES**

* Added tests to CommandGroup to ensure callbacks were getting called with the correct arguments, they weren't.
* Added nesting CommandGroup test to ensure creation of trees was possible.

# v0.9.0

* Fixed help exiting - bad exitOnHelp default.
* Fixed default not being applied correctly when no arguments were passed to the cli.

**NOTE:** This default was documented correctly, but not applied correctly. In rare cases this was a breaking change.

# v0.8.0

* Added Options `default` property, can now specify default for an Option.
* Added `path` type to Options, now resolves paths.

# v0.7.0

**BREAKING CHANGES**

* Added EnvVars
* Options: Changed how lengths worked, add required to make it less confusing.

# v0.4.0

**BREAKING CHANGES**

Changed arguments -> options object for creation of new objects. There were getting to be too many arguments to keep
straight.

# v0.3.0
Added verbosity options, -v, -vv, -vvv, and --verbose now set a cli.params.verbose level. 0 default, -v and --verbose 
set it to 1, -vv to 2, etc.

# v0.1.1
First unstable release, initial features .

This is our first release of admiral-cli. It has the basic features locked down for the 1.0 release. It will undergo 
some testing from friends and the community before hitting 1.0.

2.0 will add Help output.