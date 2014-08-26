/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />

/// <reference path="../moment.d.ts" />

/**
	# Overview
	
*/

module Overview {

	/**
		A record is a line in the table
		@should be translated in english
	*/
	export interface Record{
		codeapp: string;
		couloir: string;
		codetype: string;
		/**
			raw date
		*/
		start_time: string;
		/**
			parsed date
		*/
		date: Date;
		value: number;
		/**
			health score
		*/
		sante: number;
		/**
			Health score for each error types 
		*/
		detailSante: Array<number>;
		/**
			Health score kept as representative for this line
		*/
		resSante: number; // la santé gardée comme représentative
		/**
			Error types
		*/
		types: {[index: string]: StatsSante}
	}

	/**
		Statistic about **a** line
		@should be translated
	*/
	export interface StatsSante {
		value: number; 
		detailSante: Array<number>; // l'ensemble des santées rencontrées
		resSante: number; // la santé gardée comme représentative
	}

	/**
		Describe a statistic resume of the table
		@should be translated
	*/
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

		/**
			Add a record (a line) to this stat.
			@should be translated
		*/
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

	
	

	/**
		
		Bound to #/overview

		Show last 20e events and an table describing health for each apps
	*/

	export class OverviewController {

		// Angular
		private $scope;
		/**
			@Deprecated
		*/
		private $http;
		//-----------


		/**
			Map&lt;string, string&gt;
			List of all errors types as a map to be accessed by key directly.
		*/
		private types : {[index: string]: string}; // Map Types d'erreurs trouvés dans les tableau.

		/**
			Data source
		*/
		public data: Array<Record>;

		/**
			Stats about this table
		*/
		public stats: Statistique;

		/**
			A instance of Events.EventsController used to fetch the last events
		*/
        public eventsController: Events.EventsController;

        /**
        	@param $http Deprecated
        */		
		constructor( $scope, $http, eventsController: Events.EventsController) {
			//super();
			// Content

			this.$scope = $scope;
			this.$http = $http;

			this.types = {};
            this.eventsController = eventsController;
			this.init();
			var $bubble = $('#bubble');

            $bubble.on('mouseover', (event)=>{
                event.preventDefault();
                event.stopPropagation();
                this.eventsController.selectEvent(this.eventsController.selectedEvent);
            });
		}

		
		/**
			Fetch data from Database
		*/
		private init(): void  {
			window.startLoader();

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

		/**
			Give a link (href) for a given record.
			Usefull to disable some kind of apps or to add url params depending of a record.

			@returns a relative url
		*/
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


		/**
			Give the MAX ABSolute value of an array
		*/
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

		/**
			Compute stats for the whole table
		*/
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

		/**
			Drop cache and refresh
		*/
		public update(): void {
			Database.clearCache('overview');
			this.init();

			if(!this.$scope.$$phase)
				this.$scope.$apply();
		}


		/**
			@Deprecated
		*/
		public toolbarActive(): void {        
			$(".links a[href='#/overview']")
				.parent()
				.addClass('active')
				.siblings()
				.removeClass('active');
        }

        
        /**
			Give a weather-icon class for a health score
        */
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

		/**
			Alias to jQuery fadeIn. Classic fadeIn ends with {display:none}.
			This one only fade opacity.
		*/
		public fadeIn(jQueryObject: any): void {
			jQueryObject.animate({
				opacity: 1
			});
		}
		

	}

}


// bind to Angular
(function(){
	window.ChoregraphieControllers.controller('overviewController', ['$scope', '$http', '$routeParams',  '$window', function($scope, $http, $routeParams, $window){
        var eventsController: Events.EventsController = new Events.EventsController($scope, $http, $routeParams, $window);
        $scope.vm = new Overview.OverviewController($scope, $http, eventsController);
	}]);
})();