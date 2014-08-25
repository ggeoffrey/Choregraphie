Chorégraphie - Client
=====================

# Language

The client part of Chorégraphie is writen in [TypeScript](http://www.typescriptlang.org/).

TypeScript has been choosen for some reasons:

* It's **open source**.
* It's backed by Microsoft.
* It looks like Java / C#.
* It's well structured & (optionaly) staticaly typed
* It's cross-browser compilant.

As Chorégraphie runs as a web application, the client part have to be well coded, strong and fast. When you load several thousands values in a chart, if you have slow algorithms and spaghetti code, the browser may slow or freeze.
This is the main reason why TypeScript has been choosen: **keep your code easy to understand, modular and strict**.

# Framework

The client part is built with [AngularJS](https://angularjs.org/). 

Angular has been shoosen cause:

* It's open source
* It's backed by Google
* It fits well with a class oriented language like TypeScript

Angular help you to keep your data and your DOM up to date. With TypeScript and some library such D3js, you have here the best cocktail to build data driven and dynamic applications.


# Dependencies & links

* [D3js](http://d3js.org/) :  **D**ata **D**riven **D**ocuments. A low level library that help you to build absolutely everything in SVG (or not). D3js take your raw data as input and help you to build something visual (A chart is an example). D3 keep your visualisation synced with your data.
* [JQuery](http://jquery.com/):  If you never heard about JQuery, maybe you're on the wrong project :(
* [MomentJS](http://momentjs.com/):  Parse, validate, manipulate, and display dates in javascript. An example? *moment(new Date()).timeago() -> 'Just now'*
* [SnapJS](http://jakiestfu.github.io/Snap.js/demo/apps/toggles.html):  Put some side pannels in your page. Like an Android app.
* [ThreeJS](http://threejs.org/):  If D3js is THE good library to plot data, ThreeJS is THE good library to build **3D** apps, games, charts and everything. Shaders, particles, collisions, fluid simulations, etc...
* [Underscore](http://underscorejs.org/):  When jQuery's symbol is **$**, Underscore is **_**. Underscore is the programmer's swiss knife. It contains everything you need to filter, reduce, map, group, wrap, sort, zip, find, clone and manipulate your data.
* [LZ-String](http://pieroxy.net/blog/pages/lz-string/index.html) A string compression/decompression library. Used to reduce data size on network.
* [Socket.io](http://socket.io/) Socket.IO enables real-time bidirectional event-based communication. THE alternative to AJAX.
* [TweenJS](http://www.createjs.com/#!/TweenJS) Animate anything.

# Overview of the app structure

* Angular module `Choregraphie`
	* A little bit of configuration
	* Main TypeScript module
		* MainController
		* ConfigurationController
	* Overview TS module
		* OverviewController
	* Events TS module
		* EventsController
	* HistoryModule TS module 
		* HistoryController
	* CallTree TS module
		* CallTreeController
* Server TS module
	* Database controller
* Some global utilities & functions
