/// <reference path="../angular.d.ts" />
/// <reference path="../window.d.ts" />
/// <reference path="../underscore.d.ts" />
/// <reference path="../moment.d.ts" />


/*	
	main.js

	Roles: 
		- Déclarer un module Angular pour toute l'application Choregraphie
		- Gérer les marques d'évaluation Angular {{}}
		- Gérer le routage
		- Déclarer le controleur de la configuration (présente sur toute les pages)
		- Gérer des effets non dépendant d'angular et présent sur toutes les pages
			 (ajout de boutons en barre de navigation par exemple)
*/

/*
	Point d'entrée de l'application
	On encapsule notre code pour le protéger des accès depuis la console

	Modification des méthodes peut performantes:
*/

Array.prototype.forEach = function(fn) {
	for (var i = 0, len = this.length; i < len; i++) {
		fn.call(null,this[i],i,this);
	}
};


window.objectSize = (object: any) : number  =>{
	var size : number = 0;
	for(var i in object){
		if(object.hasOwnProperty(i)){
			size++;
		}
	}
	return size;
}








(function(){


	/*		
		Scope local (this)
	*/
	
	/*
		Définition du module principal, lié à /home
		On injecte les dépendances Angular en utilisant la notation par tableau!
		Très important car le minifieur vas remplacer les noms de variables,  mais pas le contenu des chaînes
	*/

	// On utlise le routage, les controlleurs décalarés, et les modules
    var Choregraphie = angular.module('Choregraphie', ['ngRoute', 'ChoregraphieControllers', 'angularMoment', 'snap', 'ngAnimate'])
		
		.config (['$interpolateProvider', ($interpolateProvider) => { // On change les marqueurs d'évalutation {{}} -> [[]], {{}} est utilisé par Twig
			$interpolateProvider
				.startSymbol('[[')
				.endSymbol(']]')
			}
		])

		.config ([ '$routeProvider', ($routeProvider) => { // On déclare nos routes, leurs templates récupéré par AJAX, et leurs controlleurs associés
			$routeProvider
			.when ('/overview',{ 
					templateUrl: '/template/overview', // L'URL appelée est donc http://domain.tld/path_vers_.php/<templateurl>
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

	Choregraphie.run([ '$rootScope','$location', 'amMoment', ($rootScope, $location, amMoment) => {	// Appelé à initilaisation du module
			
			// amMomet -> Angular-MomentMoment
			amMoment.changeLanguage('fr');

			$rootScope.$on('$locationChangeStart', (event, current, next) => { //Lorsque la page commence à charger
				
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

			$rootScope.$on('$routeChangeSuccess', (event, current, preview) => { //Si la page a changée avec succès (pas d'erreurs AJAX)
				$(' #view, #snap-drawer-left, #snap-drawer-right').fadeIn(window.getTransitionDuration());

				document.body.style.cursor = 'auto';
			});

		}
	]);


	// On déclare le controlleur racine dans le scope global

	window.ChoregraphieControllers = angular.module('ChoregraphieControllers', []);

})();

/*
	Scope Global (window)
*/

/*
	Actions ne nécessitant pas Angular
*/

$(document).ready( start ) // quand le DOM est pret


function start() :void {

}








/*
	Gestion du spinner
	Défini dans le scope global
*/

var $loader: JQuery = $(".loader");

/*
	Permet une utilisation souple: les appels demandant l'affichage incrémentent le compteur
	Les appels demandant la disparition le décrémentent.
	Si le compteur est à 0, le spinner disparaît
*/
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

/*
	mainController et configController situé dans la barre de navigation ou en fond
*/

window.snapperExpanded = false;
window.toggleEvents = () : void =>{
    return;
	//if(!window.snapperExpanded){
	//	window.snapper.expand('right');
	//	window.snapperExpanded = true;				
	//}
	//else{
	//	window.snapper.close();
	//	window.snapperExpanded = false;
	//}

}
window.toggleConfig = (): void => {
    return;
	//if(!window.snapperExpanded){
	//	window.snapper.expand('left');
	//	window.snapperExpanded = true;				
	//}
	//else{
	//	window.snapper.close();
	//	window.snapperExpanded = false;
	//}

}

// Ajout d'un controlleur au controlleur racine ChoregraphieControllers, au pluriel



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
	 	


	 	// Météo et fades
	 	private minDuration = 600;
	 	private maxDuration = 4000;

	 	private meteo: any;
	 	private rangeTransition: any; // D3.scale.linear
	 	private sunRise: Date;
		private sunSet : Date;  
		private sunEndRise: Date; // 2h après
		private sunBeginSet: Date; // 2h avant
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
					classes: 'glyphicon glyphicon-certificate',
					click: ()=>{
						window.toggleEvents();
					}
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
			

            

			this.getMeteo();

			setInterval(()=>{
				this.getMeteo(true);
			}, 7200000); // 2heures

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
		

		private getMeteo(update?: boolean):void {

            var next = () => {
                if (this.meteo) {

                    this.luminosity = 100 - this.meteo.clouds.all;
                    this.sunRise = new Date(this.meteo.sys.sunrise);
                    this.sunSet = new Date(this.meteo.sys.sunset);
                    this.sunEndRise = new Date(this.meteo.sys.sunrise);
                    this.sunEndRise.setHours(this.sunEndRise.getHours() + 2);
                    this.sunBeginSet = new Date(this.meteo.sys.sunset);
                    this.sunBeginSet.setHours(this.sunBeginSet.getHours() - 2);

                    this.iconUrl = 'http://openweathermap.org/img/w/' + this.meteo.weather[0].icon + '.png';
                }
                
				if(!this.scope.$$phase) this.scope.$apply();
			}

			var meteo = sessionStorage.getItem('meteo');
			if(meteo && !update){
				this.meteo = JSON.parse(meteo);
				next();
			}
			else{
				$.get('http://api.openweathermap.org/data/2.5/weather?q=Metz,FR')
					.done((data)=>{
						sessionStorage.setItem('meteo', JSON.stringify(data));
						data.sys.sunrise *= 1000;
						data.sys.sunset *= 1000;
						this.meteo = data;
						
						next();
					});
				
			}
		}

		private getTransitionDuration(): number {
            var finalDuration: number = 0;

            if (this.meteo) {
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

		// Membres

		public couloirs: Array<string>;
		public applications: Array<string>;

		public nouveauCouloir : string;
		public nouvelleApplication: string;

		constructor($scope, $http, $window) {

			this.$scope = $scope;
			this.$http = $http;
			this.window = $window;

			this.couloirs = [];
			this.applications = [];

			this.window = $window;
			
			this.init();
		}

		private init(): void {
			this.nouveauCouloir = '';
			this.nouvelleApplication = '';


			function formatData( data: any ) : Array<string>{
				var dataArray: Array<string> = []; // Transformation des données: chaines en UpperCase et Object vers Array
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
				this.couloirs =  formatData(data);
				window.stopLoader();
			});
		}


		public ajouteApplication(application: string): void {
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

		public supprimeApplication(application: string): void {
			if(application){
				var item = application.toUpperCase();
				if(this.applications.indexOf(item) > -1){

					if( window.confirm("Voulez vous vraiment supprimer "+ item +"?")){

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

		public ajouteCouloir(couloir: string): void {
			if(couloir){
				var item = couloir.toUpperCase();
				if(this.couloirs.indexOf(item) === -1 && ( item.length === 4 || item.length === 5)){
					window.startLoader();
					this.$http.get("api/set/config?action=add&target=couloir&value="+item)
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

		public supprimeCouloir(couloir: string): void {
			if(couloir){
				var item = couloir.toUpperCase();
				if(this.couloirs.indexOf(item) > -1){

					if( window.confirm("Voulez vous vraiment supprimer "+ item +"?")){

						window.startLoader();
						this.$http.get("api/set/config?action=delete&target=couloir&value="+item)
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
			if(confirm("Vous devez recharger la page pour que les modifications soit prisent en compte dans les données. Recharger maintenant?"))
				location.reload()
		}

		/*
			Verifi qu'un nom entré n'existe pas déja
			Le cas échéant, désactive le bouton d'ajout
		*/

		public verifierExistant( item : string, type: string) : boolean {
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

					for (var i = 0; i < this.couloirs.length; i++){
						if(this.couloirs[i] === item){
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
		$scope.vm = new Main.MainController($scope, $http, $routeParams); // notre module dépend de $scope et de $http
	}]);

	window.ChoregraphieControllers.controller('configController', ['$scope', '$http', '$window', function($scope, $http, $window){
		$scope.vm = new Main.ConfigController($scope, $http, $window); // notre module dépend de $scope et de $http
	}]);
})();