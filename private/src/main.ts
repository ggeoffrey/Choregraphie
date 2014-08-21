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
		- Mange animations and effects not provided by Angular
			 (buttons in the navbar is an exemple)
*/

/*
	Entry point of the application

	Customizing some methods
*/

window.toDateInputValue = function(date: Date) : string {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toJSON().slice(0,10);
};

window.objectSize = function(object: any) : number  {
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
		Dependencies are injected with the array notation. By this way, the uglify task will not broke the code.
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
			
			// amMoment -> Angular-MomentMoment
			

			$rootScope.$on('$locationChangeStart', (event, current, next) => { // When the page begin to load
				document.body.style.cursor = 'wait';
			});

			$rootScope.$on('$routeChangeSuccess', (event, current, preview) => { // if the page hase changed successfully
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
	Functions the doesn't depend of Angular
*/


/*
	Spinner management
*/

var $loader: JQuery = $(".loader");

var loadCount : number = 0;

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

function startLoader() : number {

	loadCount++;
	if($loader.css('opacity') === "0"){
		$loader.animate({
			opacity: 1
		});
	}

	return loadCount;
}







module Main {
	
	export interface Link{
		label: string;
		classes: string;
		href: string;
		click?: string;
	}


	export interface Application {
		name: string;
		type: string;
	}
	export interface Corridor {
		name: string;
		type: string;
	}

	export class MainController{
		private scope;
		private http;
		private rootParams;

	 	private _links: Array<Link>;
	 	

		constructor( $scope, $http, $rootParams) {
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

		get links() :Array<Link> {
			return this._links;
		}
	
		

		public isActiveLink = (link: Link) : string => {
			return link.href == window.routeName ? 'active' : '' ;
		}
	}


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

		constructor($scope, $http, $window) {

			this.$scope = $scope;
			this.$http = $http;
			this.window = $window;

			this.corridors = [];
			this.applications = [];

			this.window = $window;
			
			this.init();
		}

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

		private askRefresh() : void {
			if(confirm("You must reload the page to complete the changes you made. Reload *now*? "))
				location.reload()
		}

		/*
			Verifi qu'un nom entré n'existe pas déja
			Le cas échéant, désactive le bouton d'ajout
		*/

		public checkExists( item : string, type: string) : boolean {
			var found: boolean = !item; // true si l'item n'existe pas. quand angular démarre, cette fonction est appelée sans parametres.
			if(item){
				if(type === 'application' && item.length !== 4){
					found = true; // on le simule existant pour bloquer l'ajout ave cun longueru éronnée.
				}
				else if (type === 'couloir' && (item.length < 4 || item.length > 5)){
					found = true; // idem: on simule l'existance pour bloquer l'ajout
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



