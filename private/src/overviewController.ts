/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />

/// <reference path="../moment.d.ts" />

/*
	Décrit les données
*/

module Overview {

	export interface Record{
		codeapp: string;
		couloir: string;
		codetype: string;
		start_time: string;
		date: Date;
		value: number;
		sante: number;
		detailSante: Array<number>;
		resSante: number; // la santé gardée comme représentative
		types: {[index: string]: StatsSante}
	}

	export interface StatsSante {
		value: number; 
		detailSante: Array<number>; // l'ensemble des santées rencontrées
		resSante: number; // la santé gardée comme représentative
	}

	export class Statistique{
		public nb_app: number;
		public somme_appels: number;
		public somme_web: number;
		public somme_metier: number;
		public somme_nsi: number;
		public sante: number;

		constructor() {
			//super();
			this.nb_app = 0;
			this.somme_appels = 0;
			this.somme_web = 0;
			this.somme_metier = 0;
			this.somme_nsi = 0;
			this.sante = 0;
		}

		public importerDonneesDe( record: Record): void {

			this.nb_app++;
			if(record.types['nb_transaction_http'])
				this.somme_appels += record.types['nb_transaction_http'].value || 0;
			if(record.types['nb_erreur_afj_web'])
				this.somme_web += record.types['nb_erreur_afj_web'].value || 0;
			if(record.types['nb_erreur_afj_metier'])
				this.somme_metier += record.types['nb_erreur_afj_metier'].value || 0;
			if(record.types['nb_erreur_nsi_java'])
				this.somme_nsi += record.types['nb_erreur_nsi_java'].value || 0;
		}
	}

	
	

	/*
		Gère la partie "Vue d'ensemble"
	*/

	export class OverviewController {

		// Angular
		private $scope;
		private $http;
		//-----------


		private types : {[index: string]: string}; // Map Types d'erreurs trouvés dans les tableau.

		public data: Array<Record>;
		public stats: Statistique;

        public eventsController: Events.EventsController;
		
		constructor( $scope, $http, eventsController: Events.EventsController) {
			//super();
			// Content

			this.$scope = $scope;
			this.$http = $http;

			this.types = {};
            this.eventsController = eventsController;
			this.init();
		}

		

		private init(): void  {
			window.startLoader();

			var cache : string = sessionStorage.getItem('overview');
			if(false){ //cache){
				var data : Array<Record> = JSON.parse(cache);
				this.data = data; //this.groupDataByApplication(data);
				this.makeStats();
				window.stopLoader();
			}
			else
			{
				window.Database.getOverviewData(( data: Record[] )=>{

					if(_.isArray(data)){
						//sessionStorage.setItem('overview', JSON.stringify(data));
						this.data = data;//this.groupDataByApplication(data);
						this.makeStats();						
					}
					else
					{
						this.data  = [];
					}
					window.stopLoader();


					if(!this.$scope.$$phase)
						this.$scope.$apply();
				});
				
			}
		}	

		public getHref(record: Record): string {
			var href : string;
			
			if(record.codeapp.match(/SFI/)){
				href='';
			}
			else{
				href="#/history/"+record.codeapp+"/"+record.couloir;
			}		
			return  href;
		}

		private absMax(arrayOfNumbers : Array<number>) : number {
			var max : number = -Infinity;
			var absVal: number;

			arrayOfNumbers.forEach(function(num: number, index: number){
				absVal = Math.abs(num);
				if(absVal > max){
					max = absVal
				}
			});

			return max;
		}


		private makeStats(): void {
			var stats: Statistique = new Statistique();

			var codeapp: string;
			var record: Record;
			for(codeapp in this.data){
				record = this.data[codeapp];        	
				stats.importerDonneesDe(record);
			}

			this.stats = stats;
		}


		public update(): void {
			sessionStorage.removeItem('overview');
			this.init();

			if(!this.$scope.$$phase)
				this.$scope.$apply();
		}


		public toolbarActive(): void {        
			$(".links a[href='#/casParCas']")
				.parent()
				.addClass('active')
				.siblings()
				.removeClass('active');
        }

        

		public getClassWithHealth(sante: number): string {
			var strClass : string; // par défaut les éclairs
			switch (sante)
			   {				   
				   case 0: {
					   strClass = 'wi-day-sunny';
					   break;
				   }
				   case 1: {
					   strClass = 'wi-day-cloudy';
					   break;
				   }
				   case 2: {
					   strClass = 'wi-rain';
					   break;
				   }
				   default: {
					   strClass = 'wi-lightning';
				   }
			   }
			 return strClass;
		}

		public fadeIn(jQueryObject: any): void {
			jQueryObject.animate({
				opacity: 1
			});
		}
		

	}

}


(function(){
	window.ChoregraphieControllers.controller('overviewController', ['$scope', '$http', '$routeParams',  '$window', function($scope, $http, $routeParams, $window){
        var eventsController: Events.EventsController = new Events.EventsController($scope, $http, $routeParams, $window);
        $scope.vm = new Overview.OverviewController($scope, $http, eventsController);
	}]);
})();