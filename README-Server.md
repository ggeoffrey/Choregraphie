Chorégraphie - Server
=====================

** To start the app ** use:
```bash
node bin/www
```
or
```bash
DEBUG=Choregraphie node bin/www
```
to debug the network layer (sockets) use :
```bash
DEBUG=* node bin/www
```

You can edit everything (ports, restrictions) in the config.coffee file.

Database configuration is specific to the used module. You will find the database config file in ./modules/**your_database_type**Connector/config.coffee

# Language

The server part of Chorégraphie is written in [CoffeeScript](http://coffeescript.org/).

CoffeeScript has been chosen for some reasons:

* It's **open source**.
* It's well integrated in NodeJS
* It's easy to write
* Application structure is easier to understand
* Easier data manipulation
* You can make a module in JavaScript alongside an other module in CoffeeScript


As the server is *just* an Api, the goal is to make the server part easy to understand and to extand.

You can debug your NodeJS app like any other and the priority isn't to performances but to flexibility.

This is why CoffeeScript is better than TypeScript **here**. With CoffeeScript you can focus on data and build smarter code quickly.

Be aware that CoffeeScript and TypeScript are to JavaScript like Xtend and Scala are to Java. You will understand both of them if you completely understand their parent.



# Framework

The server part is built with [ExpressJS](http://expressjs.com/). 

Express has been chosen cause:

* It's open source
* It's a tenor in the NodeJS world.
* It's not a full-stack framework, it's light, efficient and very fast.
* It comes with all needed modules to build RESTfull Api or complex websites.
* It's *ready to scale* with Redis and cluster

ExpressJS provide you routes, HTTP tools, HTML & CSS preprocessors, session & cookies management, etc…


# Dependencies

We are on the server part, so dependencies comes from npm. Look at package.json file for the full list.

* [Async](https://www.npmjs.org/package/async) Higher-order functions and common patterns for asynchronous code
* [pg](https://www.npmjs.org/package/pg) PostgreSQL client - pure JavaScript & libpq with the same API
* [socket.io](https://www.npmjs.org/package/socket.io)  Node.JS real time framework server
* [underscore](https://www.npmjs.org/package/underscore) JavaScript's functional programming helper library.
* [jade](http://jade-lang.com/) A very good HTML template engine.


# App structure overview

* HTML templates are written in Jade
* CSS templates are written in pure CSS but can be written in Stylus
* Modules are Class-Structured as much as possible.



* bin
	* www
* modules/
	* api   :   Central API
	* configManager   :   Manage configuration files
	* postgresConnector   :  Connect to PostgreSQL
	* restApi   :    Get data via AJAX
	* socketManager    :    Get data via socket.io (WebSockets/polling)
* routes
	* index :  '/' route
	* angularTemplate : '/template' route, used by Angular on client

* app.coffee   :   The  *main()* equivalent, called by bin/www

* install.js  :  an install script


The client source code (TypeScript files) stands in the ./private folder. 

The ./public folder is widely accessible via any browser. Place statics files you want to serve in ./public . Other folders *are not* accessible.


# Tools

Grunt is used as task runner.

To build the client app:
```bash
grunt
```

To generate documentation:
```bash
grunt doc
```

To run tests:
```bash
grunt test
```

To generate an uncompressed, debuggable client app:
```bash
grunt preprod
```

The full commands list can be found in the Gruntfile.coffee file.