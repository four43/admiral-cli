Admiral-CLI
===========

It's a framework! A CLI framework for Node.js. There are a few command line interface (CLI) frameworks
available for Node.js already. These provide a lot of features, but I found them lacking in some basic
validation features and we wanted to create one with less configuration but stronger validation.

##Goals:

* Commands
    * Provide events for command based routing, e.g. git pull origin development
    * Auto-complete on commands
* Options
    * Short and long options, e.g. ssh -i ~/key-file.pem
    * Description
    * Required
    * Validation
* Flags
    * Allow for single flags, e.g. rm -f
    * Combined flags, e.g. rm -rf
* Order
    * Allow custom order command, option, command or option, command etc.