/// <reference path="../angular.d.ts" />
/// <reference path="../window.d.ts" />

/// <reference path="../moment.d.ts" />


/*	
	main.js

	Goals: 
		- Create a Angular module for all the application
		- Change Angular symbols {{}}
		- Manage routing
		- Create a controller for the configuration view
		- Manage animations and effects not provided by Angular
			 (buttons in the navbar is an exemple)
*/

/*
	Entry point of the application

	Customizing some methods
*/

/**
	Transform a Date to a well formated string able, to be put in an &lt;input type="date"/&gt; element.
	@param date A javascript Date object.
	@return "2014-08-25"

*/
function toDateInputValue(date: Date) : string {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toJSON().slice(0,10);
};

/**
	Give the size of an object (by counting his keys). 
	@deprecated Use _.size instead
	@param object An object.
*/
function objectSize(object: any) : number  {
	var size : number = 0;
	for(var i in object){
		if(object.hasOwnProperty(i)){
			size++;
		}
	}
	return size;
};








(function(){


	/*		
		Local scope (this)

		Here comes the main module, bound to /home
		Dependencies are injected with the array notation. By this way, the uglify task will not break the code.
	*/

    var Choregraphie = angular.module('Choregraphie', ['ngRoute', 'ChoregraphieControllers', 'angularMoment', 'snap', 'ngAnimate'])
		
		.config (['$interpolateProvider', ($interpolateProvider) => { // We change the markers {{}} -> [[]], {{}} is used by some preprocessors
			$interpolateProvider
				.startSymbol('[[')
				.endSymbol(']]')
			}
		])

		.config ([ '$routeProvider', ($routeProvider) => { // This is the router. Templates are loaded via AJAX
			$routeProvider
			.when ('/overview',{ 
					templateUrl: '/template/overview',
					controller: 'overviewController'
				}
			)
			.when ('/callTree', {
					templateUrl: '/template/callTree',
					controller: 'callTreeController'
				}
			)			
			.when('/history', {
					templateUrl: '/template/history',
					controller: 'historyController'
				}
			)
			.when('/history/:codeapp/:couloir', {
					templateUrl: '/template/history',
					controller: 'historyController'
				}
            )
            .when('/events', {
                    templateUrl: '/template/events',
                    controller: 'eventsController'
                }
            )
            .when('/events/:codeapp/:couloir', {
                    templateUrl: '/template/events',
                    controller: 'eventsController'
                }
            )
			.otherwise({
				redirectTo: '/overview'
			})
		}])

		.config(['snapRemoteProvider', (snapRemoteProvider)=> {

		}]);

	Choregraphie.run([ '$rootScope','$location', 'amMoment', ($rootScope, $location, amMoment) => {	// Called when the module is instantiated 
			
			// amMoment -> Angular-Moment
			

			$rootScope.$on('$locationChangeStart', (event, current, next) => { // When the page begin to load
				document.body.style.cursor = 'wait';
			});

			$rootScope.$on('$routeChangeSuccess', (event, current, preview) => { // if the page has changed successfully
				document.body.style.cursor = 'auto';

				setTimeout(function () {
					var $anchor = $('.bubble-anchor');
	                var $bubble = $('#bubble');                

	                var anchorOffset = $anchor.offset();
						                
	                $bubble.css('opacity', '1');
	                if (current.$$route.controller === 'historyController') {
	                    var $pie = $('#pie');
	                    $bubble.animate({
                            top: anchorOffset.top,
                            left: anchorOffset.left,
                            'width': $pie.width(),
                            'height': $pie.width()
                        }).animate({
                            'margin-top': '1em',
                            'margin-left': '-1em',
                        });
	                }
	                else if (current.$$route.controller === 'callTreeController'){
	                	$bubble.animate(anchorOffset);
	                }
	                else {
	               		anchorOffset.top -= $bubble.height() / 3;
	                	anchorOffset.left += $bubble.width() / 2;                 
	                    $bubble.children('.btn').css({
	                        'background-color': 'gray'
	                    });
	                    $bubble.animate(anchorOffset);	                    
	                }
                }, 1500);
			});

		}
	]);


	// The root controller is declared in the global scope.

	window.ChoregraphieControllers = angular.module('ChoregraphieControllers', []);

})();

/*
	Global scope (window)
*/

/*
	Functions not depending of Angular
*/


/*
	Spinner management
*/

/**
	A jquery object pointing to the spinner GIF in the navbar. Saved in a variable to improve perfs.
*/
var $loader: JQuery = $(".loader");

/**
	Record how many loading procedures are pendings. The loader GIF is visible if loadcount > 0
*/
var loadCount : number = 0;

/**
	Decrement loadCount and hide $loader if loadcount < 1
	@return the current loadCount
*/
function stopLoader() : number{
	loadCount--;
	if(loadCount < 1){
		$loader.animate({
			opacity: 0
		});
	}
	
	if(loadCount < 0)  // au cas ou ...
		loadCount = 0;

	return loadCount;
}

/**
	Increment loadCount and show $loader if $loader's opacity is 0
	@return the current loadCount
*/
function startLoader() : number {

	loadCount++;
	if($loader.css('opacity') === "0"){
		$loader.animate({
			opacity: 1
		});
	}

	return loadCount;
}






/**
	# Main module
	Managing configuration panel and the navbar.
	The contained controllers aren't bound to ng-view and not registered in the Angular Router, they are available on every views (everywhere in the app).
*/
module Main {
	
	/**
		A link in the navbar
		@usedBy MainController 
	*/
	export interface Link{
		/**
			The visible name of the link
		*/
		label: string;
		/**
			For icons, classes listed in this string are applied to the element.
		*/
		classes: string;
		/**
			relative href listed in the Angular router,  eg: '#/events'
		*/
		href: string;
		/**
			@Deprecated
		*/
		click?: string;
	}


	/**
		An application
		@usedBy ConfigController
	*/
	export interface Application {

		name: string;
		/**
			Origin
			@In {'db', 'config'} see the global documentation -> Limiting data to a specified list
		*/
		type: string;
	}
	/**
		Same as an Application.
		@usedBy ConfigController
	*/
	export interface Corridor {
		name: string;
		type: string;
	}

	/**
		Controller bound to the navbar.

		Available eveywhere in the app. (doesn't depends of ng-view)
	*/
	export class MainController{
		private scope;
		private http;
		private rootParams;

	 	private _links: Array<Link>;
	 	

	 	/**
			@dependencies $scope, $http(**Deprecated**), $rootParams(**Deprecated**)
	 	*/
		constructor($scope, $http, $rootParams) {
			this.scope = $scope;
			this.http = $http;
			this.rootParams = $rootParams;

			var panelWidth: number = $('#snap-small-panel').width();
			window.snapperExpanded = false;
			window.snapper = new Snap({
                element: document.getElementById('content'),
                //dragger: document.getElementById('dragger'),
				//maxPosition: panelWidth,
				//minPosition: -panelWidth
			});



			this._links = [
				{
					label: "Overview",
					href: '#/overview',
					classes: 'glyphicon glyphicon-cloud'
				},
				{
					label: "Events",
					href: '#/events',
					classes: 'glyphicon glyphicon-certificate'
				},{
					label: "History",
					href: '#/history',
					classes: 'glyphicon glyphicon-signal'
				},
				{
					label: "Calls",
					href: '#/callTree',
					classes: 'glyphicon glyphicon-resize-full'
				}

			];
			


		}

		/**
			Simple getter
		*/
		get links() :Array<Link> {
			return this._links;
		}
	
		
		/**
			Give the 'active' string if the links is the current view.

			Used to apply classes.
			@calledBy Angular ng-repeat

		*/
		public isActiveLink = (link: Link) : string => {
			return link.href == window.routeName ? 'active' : '' ;
		}
	}


	/**
		Bound to the side pannel.

		Allows to manage apps & corridors.
	*/
	export class ConfigController {
		
		// Angular
		private $scope : ng.IScope;
		private $http: ng.IHttpService;

		private window: any;

		// Members

		public corridors: Corridor[];
		public applications: Application[];

		public newCorridor : string;
		public newApplication: string;

		/**
			@dependencies $scope, $http(**Deprecated**), $window
		*/
		constructor($scope, $http, $window) {

			this.$scope = $scope;
			this.$http = $http;
			this.window = $window;

			this.corridors = [];
			this.applications = [];

			this.window = $window;
			
			this.init();
		}

		/**
			Fetch data from database 
		*/
		private init(): void {
			this.newCorridor = '';
			this.newApplication = '';


			window.startLoader();

			window.Database.getApplications((data:Application[])=>{
				this.applications =  data;
				window.stopLoader();
			});


			window.startLoader();

			window.Database.getCorridors((data:Corridor[])=>{
				this.corridors =  data;
				window.stopLoader();
			});
		}


		/**
			Add an application in the restrictedData.json file on server.
			Work only if the application or corridor doesn't already exist and if the string is well formated.
			@param application A 4 character string
			@calledBy Angular ng-click

		*/
		public addApplication(application: string): void {
			if(application){
				var item = application.toUpperCase();
				var found = _.findWhere(this.applications, {name: item});

				if( !found && item.length === 4){
					window.startLoader();
					window.Database.addApplication(item, ()=>{
						this.init();
						window.stopLoader();
						this.askRefresh();
					});
				}
			}
		}

		/**
			Delete an existing application in restrictedData.json
			@param application An existing application name
			@calledBy Angular ng-click
		*/
		public deleteApplication(application: string): void {
			if(application){
				var item = application.toUpperCase();
				var found = _.findWhere(this.applications, {name: item});
				if(found){

					if( window.confirm("Did you confirm the deletion of "+ item +"?")){

						window.startLoader();
						window.Database.deleteApplication( item,  (data :any) => {
							this.init(); // on recharge
							window.stopLoader();
							this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
						});
					}
				}
			}
		}

		/**
			Add a corridor in the restrictedData.json file on server.
			Work only if the application or corridor doesn't already exist and if the string is well formated.
			@param corridor A 4 to 5 character string
			@calledBy Angular ng-click

		*/
		public addCorridor(corridor: string): void {
			if(corridor){
				var item = corridor.toUpperCase();
				var found = _.findWhere(this.corridors, {name: item});
				if(!found && ( item.length === 4 || item.length === 5)){
					window.startLoader();
					window.Database.addCorridor( corridor,  (data :any)=>{
							this.init(); // on recharge
							window.stopLoader();
							this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
					});
				}
			}
		}

		/**
			Delete an existing corridor in restrictedData.json
			@param corridor An existing corridor name
			@calledBy Angular ng-click
		*/
		public deleteCorridor(corridor: string): void {
			if(corridor){
				var item = corridor.toUpperCase();
				var found = _.findWhere(this.corridors, {name: item});
				if(found){

					if( window.confirm("Did you confirm the deletion of "+ item +"?")){

						window.startLoader();
						window.Database.deleteCorridor( item,  (data :any) => {
							this.init(); // on recharge
							window.stopLoader();
							this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
						});
					}
				}
			}
		}

		/**
			Ask the user to refresh his page to fully apply modifications
		*/
		private askRefresh() : void {
			if(confirm("You must reload the page to complete the changes you made. Reload *now*? "))
				location.reload()
		}

		/**
			Check if an item already exist.
			
			If it doesn't, the '+' button is disabled.

			@param item An application name or a corridor name
			@param type  in: {'couloir', 'application'}

			@should be rewritten in english
		*/

		public checkExists( item : string, type: string) : boolean {
			var found: boolean = !item; // true if item is null, this function is called with empty params when angular starts.
			if(item){
				if(type === 'application' && item.length !== 4){
					found = true; // we simulate it's existancy to block the button
				}
				else if (type === 'couloir' && (item.length < 4 || item.length > 5)){
					found = true; // we simulate it's existancy to block the button
				}
				else{
					item = item.toUpperCase();

					for (var i = 0; i < this.corridors.length; i++){
						if(this.corridors[i].name === item){
							found = true;
							break;
						}
					}

					if (!found){
						for (var i = 0; i < this.applications.length; i++){
							if(this.applications[i].name === item){
								found = true;
								break;
							}
						}
					}
				}
			}
			return found;
		}

		/**
			@Deprecated
		*/
		public toggle = (): void => {
			this.window.toggleConfig();
		}
	}

}


(function(){
	window.ChoregraphieControllers.controller('mainController', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
		$scope.vm = new Main.MainController($scope, $http, $routeParams); // Our module depends of $scope and $http
	}]);

	window.ChoregraphieControllers.controller('configController', ['$scope', '$http', '$window', function($scope, $http, $window){
		$scope.vm = new Main.ConfigController($scope, $http, $window);
	}]);
})();



