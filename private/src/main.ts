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

/*Array.prototype.forEach = function(fn) : void {
	for (var i = 0, len = this.length; i < len; i++) {
		fn.call(null,this[i],i,this);
	}
};*/

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

				window.lastRouteName = window.routeName;
				window.routeName = '#'+$location.path();

                if (window.lastRouteName === '#/callTree') {
                    var duration = window.getTransitionDuration() / 2;
                    if (duration > 0) {
                        event.preventDefault();
                        $(' #view, #snap-drawer-left, #snap-drawer-right').fadeOut(duration, function () {
                            console.log(current);
                            console.log(next);
                            window.location = current;
                        });
                    }
                }
                

			});

			$rootScope.$on('$routeChangeSuccess', (event, current, preview) => { // if the page hase changed successfully
				$(' #view, #snap-drawer-left, #snap-drawer-right').fadeIn(window.getTransitionDuration());

				document.body.style.cursor = 'auto';
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

	export class MainController{
		private scope;
		private http;
		private rootParams;

	 	private _links: Array<Link>;
	 	


	 	// weather and fades
	 	private minDuration = 600;
	 	private maxDuration = 4000;

	 	private weather: any;
	 	private rangeTransition: any; // D3.scale.linear
	 	private sunRise: Date;
		private sunSet : Date;  
		private sunEndRise: Date; // 2h after
		private sunBeginSet: Date; // 2h before
		public luminosity: number;

		public iconUrl: string;

		public disableTransition: boolean;
		public forceTransition: boolean;
		

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
			

            

			this.getWeather();

			setInterval(()=>{
				this.getWeather(true);
			}, 7200000); // 2h

			this.rangeTransition = d3.scale.linear()
									 .domain([0, 100])
									 .range([this.maxDuration, this.minDuration]);

			window.getTransitionDuration = this.getTransitionDuration;

			this.disableTransition = !!parseInt(sessionStorage.getItem('disableTransition')) || false;
			this.forceTransition = !!parseInt(sessionStorage.getItem('forceTransition')) || false;

		}

		get links() :Array<Link> {
			return this._links;
		}
		

		private getWeather(update?: boolean):void {

            var next = () => {
                if (this.weather) {

                    this.luminosity = 100 - this.weather.clouds.all;
                    this.sunRise = new Date(this.weather.sys.sunrise);
                    this.sunSet = new Date(this.weather.sys.sunset);
                    this.sunEndRise = new Date(this.weather.sys.sunrise);
                    this.sunEndRise.setHours(this.sunEndRise.getHours() + 2);
                    this.sunBeginSet = new Date(this.weather.sys.sunset);
                    this.sunBeginSet.setHours(this.sunBeginSet.getHours() - 2);

                    this.iconUrl = 'http://openweathermap.org/img/w/' + this.weather.weather[0].icon + '.png';
                }
                
				if(!this.scope.$$phase) this.scope.$apply();
			}

			var weather = sessionStorage.getItem('weather');
			if(weather && !update){
				this.weather = JSON.parse(weather);
				next();
			}
			else{
				$.get('http://api.openweathermap.org/data/2.5/weather?q=Metz,FR')
					.done((data)=>{
						sessionStorage.setItem('weather', JSON.stringify(data));
						data.sys.sunrise *= 1000;
						data.sys.sunset *= 1000;
						this.weather = data;
						
						next();
					});
				
			}
		}

		private getTransitionDuration(): number {
            var finalDuration: number = 0;

            if (this.weather) {
                finalDuration = this.minDuration;
                var now: Date = new Date();

                var isNight = (now < this.sunRise) || (now > this.sunSet);
                var isDark = !isNight && (now < this.sunEndRise) && (now > this.sunBeginSet);

                if (this.disableTransition) finalDuration = 0;
                else if (this.forceTransition) finalDuration = this.maxDuration;
                else if (isNight) finalDuration = this.maxDuration;
                else if (isDark || this.luminosity <= 10) finalDuration = this.maxDuration * (0.75);
                else {
                    finalDuration = this.rangeTransition(this.luminosity);
                }
            }

			return finalDuration;

		}

		public updatePreferences = (lastSelected : string): void =>{

			if(this.disableTransition && this.forceTransition){
				this[lastSelected] = false;
			}

			var str = ''+(this.disableTransition?1:0);
			sessionStorage.setItem('disableTransition', str );

			str = ''+ (this.forceTransition?1:0 );
			sessionStorage.setItem('forceTransition', str );
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

		public corridors: Array<string>;
		public applications: Array<string>;

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


			function formatData( data: any ) : Array<string>{
				var dataArray: Array<string> = []; // Data transformation: strings to UpperCase and Objects to Arrays
				if(_.isObject(data)){
					var str : string;
					for (str in data){
						if(str){
							dataArray.push(data[str]);
						}
					}
				}
				for (var i = 0; i < dataArray.length; i++){
					dataArray[i] = dataArray[i].toUpperCase();
				}
				return dataArray;
			}

			window.startLoader();

			window.Database.getApplications((data:string[])=>{	
				this.applications =  formatData(data);
				window.stopLoader();
			});


			window.startLoader();

			window.Database.getCorridors((data:string[])=>{
				this.corridors =  formatData(data);
				window.stopLoader();
			});
		}


		public addApplication(application: string): void {
			if(application){
				var item = application.toUpperCase();
				if(this.applications.indexOf(item) === -1 && item.length === 4){
					window.startLoader();
					this.$http.get("api/set/config?action=add&target=application&value="+item)
						.success( (data :any)=>{
							this.init(); // on recharge
							window.stopLoader();
							this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
						})

						.error(function(error){
							window.stopLoader();
						});
				}
			}
		}

		public deleteApplication(application: string): void {
			if(application){
				var item = application.toUpperCase();
				if(this.applications.indexOf(item) > -1){

					if( window.confirm("Did you confirm the deletion of "+ item +"?")){

						window.startLoader();
						this.$http.get("api/set/config?action=delete&target=application&value="+item)
							.success( (data :any) => {
								this.init(); // on recharge
								window.stopLoader();
								this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
							})

							.error(function(error){
								window.stopLoader();
							});
					}
				}
			}
		}

		public addCorridor(corridor: string): void {
			if(corridor){
				var item = corridor.toUpperCase();
				if(this.corridors.indexOf(item) === -1 && ( item.length === 4 || item.length === 5)){
					window.startLoader();
					this.$http.get("api/set/config?action=add&target=corridor&value="+item)
						.success( (data :any)=>{
							this.init(); // on recharge
							window.stopLoader();
							this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
						})

						.error(function(error){
							window.stopLoader();
						});
				}
			}
		}

		public deleteCorridor(corridor: string): void {
			if(corridor){
				var item = corridor.toUpperCase();
				if(this.corridors.indexOf(item) > -1){

					if( window.confirm("Did you confirm the deletion of "+ item +"?")){

						window.startLoader();
						this.$http.get("api/set/config?action=delete&target=corridor&value="+item)
							.success( (data :any) => {
								this.init(); // on recharge
								window.stopLoader();
								this.askRefresh(); // Demande de rafraichissement de la page. l'user peut refuser pour Ajouter/supprimer d'autres items
							})

							.error(function(error){
								window.stopLoader();
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
						if(this.corridors[i] === item){
							found = true;
							break;
						}
					}

					if (!found){
						for (var i = 0; i < this.applications.length; i++){
							if(this.applications[i] === item){
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