/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />



/**
	HistoryModule

	Should be named just `History` but named HistoryModule cause an other History module already exists.

	@should be partialy rewritten & cleaned. Too much spaghetti code.
	@should be translated
*/
module HistoryModule {

	/**
		Char used to replace `undefined` or `null` or white spaces.

		Currently '\u2015'.
	*/
	var nullSymbol: string = '\u2015';


	/**
		Stats used to build the table.
	*/
	export class Statistique {

		/**
			Well formated error type
		*/
		private _err : string;

		/**
			Raw error type
		*/
		private raw_err: string;

		/**
			Sum of recorded values
		*/
		private _value: number; // nombre d'erreurs enregistrées

		/**
			Percent computed face to a total
		*/
		private _pct: number; // pourcentage par rapport à un total

		/**
			Amount of HTTP transactions
		*/
		private _http: number; //nombre de transactions HTTP

		/**
			Errors percent
		*/
		private _pct_err: number; // pourcentage d'erreur

		/**
			Errors percents face to total.

			@explanation if you have [{100 calls, 10 errors}, {100 calls, 10 errors}].
			_pct_err will be 10(%) for each records. _pct_err_total will be 50(%) for the first and 50(%) for the second
		*/
		private _pct_err_total: number; // pourcentage d'erreur par rapport au total


		/**
			Is this stats and calls statistic ?
		*/
		private isHttp: boolean;

		/**
			Is this stat a fake stats?

			Fake stats
		*/
		private _isFake: boolean;

		constructor( codetype: string, value?: number, http?: number) {

			

			



			var nom:string;
			var capitalizer : Array<string> = [];
			nom = codetype.replace('nb_erreur', '');
			nom = nom.replace('nb_transaction', 'transac.');

			capitalizer = nom.split('_');

			capitalizer.forEach(function(item:string, index:number){
				item = item.charAt(0).toUpperCase() + item.slice(1); 
			});

			nom = capitalizer.join(' ');

			this._err = nom;
			this.raw_err = codetype;

			this.isHttp = !!(this.raw_err.match(/nb_transaction_http/));

			if(this.isHttp)
				this._value = null;
			else
				this._value = value || 0;

			this._http = http || 0;

			if(this._value){
				this._pct_err = Math.round(((this._http/this._value)*100)*100)/100;
				if(this._pct_err > 1000) this._pct_err = Math.floor(this._pct_err);				
			}


			$('#bubble').fadeOut();


		}

		/**
			Used to fill the table
		*/
		public static fakeStat = (codetype: string): Statistique => {
			var stat : Statistique = new Statistique(codetype);
			stat.isFake = true;
			return stat;
		};

		set isFake(bool: boolean){
			this._isFake = bool;
		}

		get err(): string { return this._err; }

		get pct(): string {
			if(this._pct >= 1)
				return String(this._pct);
			else
				return '< 1%';
		}

		get pct_err(): string{
			if(this._pct_err >=0 )
				return String(this._pct_err);
			else
				return nullSymbol;
		}
		get pct_err_total(): number {
			return this._pct_err_total;
		}

		/**
			Comput error percent face to a total reference
			@should be translated
		*/
		public calculePourcentage = (totalReference : number): void => {
			var value: number;
			var percent: number;

			if(this.isHttp)
				value = this._http;
			else
				value = this._value;

			percent = (value / totalReference ) * 100;
			percent = Math.round(percent*100);
			percent /= 100;

			this._pct = percent;
		};


		/**
			Comput total error percent face to a total reference
			@should be translated
		*/
		public computeErrPct = (totalReference : number): void => {
			var value: number;
			var percent: number;

			if(this.isHttp)
				this._pct_err_total = 0;
			else
				percent = (this._pct_err / totalReference ) * 100;
				percent = Math.round(percent*100);
				percent /= 100;

				this._pct_err_total = percent;
		};

		/**
			Add a value to this stat
		*/
		public addValue = (value:number): void => {
			if(value > 0){
				if(this.isHttp)
					this._http += value;
				else
					this._value+= value;
			}
		};

		/**
			Give a textual representation of `value`:
			* 125.46  (example)
			* <1
			* nullSymbol
		*/
		get value(): string {
			var retour: string;
			if(this.isHttp)
				retour = nullSymbol;
			else
				retour = String(this._value);

			if(!parseInt(retour,10))
				return nullSymbol;
			else
				return retour;
		}
		get http(): string {
			return String(this._http);
		}
	}

	/**
		Used to extract params from url
	*/
	interface RouteParams{
		codeapp: string;
		couloir: string;
	}

	/**
		A record is value in the line chart
	*/
	export interface Record{
		starttime: any;

		codeapp?: string;
		couloir?: string;
		code?: string;
		codetype?: string;
		value?: number;
		http?: number;

		somme?: number;
		average?: number;
		stddev?: number;
	}





	/**
		History section Angular controller 
	

		Data are 

		((corridor*application) where DATE >min) intersection ((corridor*application) where DATE < max)

		There is a unusual behaviour:

		- Data are fetched
		- If there is data, we parse it manualy, then we save them in JSON.
		- The line chart is built, data are filtered
		- A parallel task is started to build the table with these new filtered data
		- These data are filtered again by the table
		- An other parallel task is started to build the chart with these filtered-filtered-data
			

		Visual elements building is made in parallel execution, as soon as data are ready.
		Each diagram filter and select data, then give then to the following.
		
		This execution avoid repetitiv work and partialy-filtered data storage.
		
	*/

	export class HistoryController {

		private scope: ng.IScope;

		/**
			@Deprecated
		*/
		private http: ng.IHttpService;
		private routeParams: RouteParams;

		/**
			Avoid item selection before the end of loading
			@usedBy Angular ng-disabled
			@should be translated
		*/
		public bloqueCouloirs: boolean;
		/**
			@should be translated
			@usedBy Angular ng-disabled
		*/
		public bloqueApplications: boolean;

		/**
			jQuery object pointing to the div#histogram
		*/
		public histogram : JQuery;	

		/**
			Current selected corridor
		*/
		public couloir: string;
		/**
			Current selected app
		*/
		public application: string;

		/**
			List of corridors available
			@usedBy ng-repeat in select element
		*/
		public couloirs: Array<string>;

		/**
			List of applications available
			@usedBy ng-repeat in select element
		*/
		public applications: Array<string>;

		/**
			the pair (app x corridor) is compatible and have been chosen?
		*/
		public chosen:boolean;

		/**
			the pair (app x corridor) isn't compatible ?
		*/
		public noMatches: boolean;

		/**
			Fetched values
		*/
		private data: Array<Record>;

		/**
			JSON string used to backup data.
		*/
		private dataBackup: string; // json

		/**
			Fetch trend values
		*/
		private trend: {[index:string]: Array<Record>};

		/**
			JSON string used to backup data.
		*/
		private trendBackup: string; // json


		/**
			Start time selected with the brush
		*/
		private start: any;
		/**
			End time selected with the brush
		*/
		private stop: any; //  type Date ?


		/**
			Should the dots be visible on the line chart ?
			@Deprecated circles now shown by default
		*/
		private circles: boolean;
		/**
			If the line interpolation supports it, this variable hold the tension factor.
			@see D3js SVG>Line documentation
		*/
		private tension : number;

		/**
			Line interpolation type
			@see D3js SVG>Line documentation
		*/
		private interpolation: string;

		// tooltip

		/**
			Raw error name visible if mouse over a data point
			@useBy Angular in tooltip
		*/
		private histogramNomRapport: string;
		/**
			Value visible if mouse over a data point
			@useBy Angular in tooltip
		*/
		private histogramValeurRapport: number;

		/**
			Date visible if mouse over a data point
			@useBy Angular in tooltip
		*/
		private histogramDateRapport: string;
		// --------


		// Pie chart

		/**
			Mixing calls and errors in the pie chart is possible. But it's a nonsense.
			If the Pie contain at least 1 http statistic. The pie chart type is 'Calls'
			IN {'Calls', 'Err (%)'}

			@should use an Enum
		*/
		public pieChartType: string;

		/**
			Does the pie chart contains http value ?
		*/
		private pieChartContainsHttpValues: boolean;


		// ------


		/**
			Filtered data extracted from full data

			Filtered by date
		*/
		private fdata: Array<Record>;

		/**
			Index is error type
			Value is an array of records
			Usefull to filter errors by types
		*/
		private unfilteredReports: {[index:string]: Array<Record>} = {};

		/**
			Where the brush should start (not the selection)
		*/
		private minDate: Date;

		/**
			Used to adapt the linear interpolation reduction to make the line fit in the chart.
		*/
		private maxValue: number;

		/**
			Height of the brush element in the DOM. (px)
		*/
		private heightBrush: number;



		

		/**
			Table array representation
			@usedBy Angular ng-repeat in div#table
		*/
		public tableau: Statistique[];

		/**
			A message under the line chart showing information about particular values
			@usedBy Angular
		*/
		public messageHistogramme: string;

		/**
			Should the line chart update on mousemove ?
			@Deprecated now always on
		*/
		public realtime: boolean;

		/**
			Block the 'resize button' while the line chart is rendering
			@usedBy Angular ng-disabled
		*/
		public resizeDisabled: boolean = true;

		/**
			Map&lt;string, boolean&gt; allowing to select lines in table.
			String key is data error type.
			This Map is used to include or exclude data of the filtered data.
		*/
		public lignesSelectionees: {[index:string]: boolean};


		// Outils globaux

		/**
			d3.scale.categoryXX();
			Mapping error type with a color.
			@see D3js documentation
		*/
        private colorBuilder; 


        // Gestionnaire d'évenements

        /**
			Events.eventsController instance used to fetch events corresponding to (app x corridor)
        */
        private eventsController: Events.EventsController;

        /**
        	List of events fetched
        */
        private events: Array<Events.Event>;

        /**
        	Filtered with the brush. ie: Events between dateMin and dateMax
        */
        private filteredEvents: Array<Events.Event>;


        /**
			@param $http Deprecated
        */
		constructor($scope, $http, $routeParams, eventsController : Events.EventsController) {
			this.scope = $scope;
			this.http = $http;
            this.routeParams = $routeParams;

            this.eventsController = eventsController;            

			this.bloqueCouloirs = false;
			this.bloqueApplications = false;

			this.histogram = $('#histogram');
			

			this.colorBuilder = d3.scale.category10();

			this.heightBrush = 80;

            this.init();            
		}

		/**
			Get params from url or from user choice and fetch apps and corridors list.
		*/
		private init = (): void=>{
			if(this.routeParams.codeapp){
				this.couloir = this.routeParams.couloir;
				this.application = this.routeParams.codeapp;
			}

			this.bloqueCouloirs = false;
			this.bloqueApplications = false;

			this.initRangePicker();
			window.startLoader();


			// traitement des données
			var nextApp = (data: any): void => {
				if(_.isObject(data)){
					data = _.toArray(data);
					data = _.sortBy(data, function(value: number){
						return value;
					});
				}

				this.applications = data;

				if(this.routeParams.codeapp)
					this.application = this.routeParams.codeapp;
				else
					this.application = this.applications[0];

				window.stopLoader();

				this.bloqueApplications = false
				this.updateScope();
			}

			// Récupération des données
			var listeApp : string;
			listeApp = window.sessionStorage.getItem('listeApp');

			
				window.Database.getApplications((data:any)=>{
					nextApp(data);
				});
			


			// traitement des couloirs

			var nextCouloirs = (data:Array<string>) : void => {
				this.couloirs = data;
				if(this.routeParams.couloir)
					this.couloir = this.routeParams.couloir;
				else
					this.couloir = this.couloirs[0];

				window.stopLoader();
				this.bloqueCouloirs = false;
				this.updateScope();
			};

			// récupération des couloirs

			window.startLoader();

			var listeCouloirs: string;
			
				window.Database.getCorridors((data:any)=>{
					nextCouloirs(data);
				});
			

            //On charge les évenements en premier comme ça, on les à pour toute la suite
            this.eventsController.getByCouple(this.application, this.couloir, (events) => {
                this.events = events;
			    this.load();
            });

		}

		/**
			Load data for (app x corridor)
		*/
		private load = (): void => {
			if(this.application && this.couloir){
				var dataLoaded: boolean = false;
                var trendLoaded: boolean = false;

                

				var next = (): void =>{
					if(dataLoaded && trendLoaded){

						this.updateScope();

						// calcul du max et mappage en objet des données non filtrées
						var maxValue: number = -Infinity;


						this.data.forEach((report)=>{
							if(!this.unfilteredReports[report.codetype]){
								this.unfilteredReports[report.codetype] = [];
							}
							this.unfilteredReports[report.codetype].push(report);
							if (report.value > maxValue)
								maxValue = report.value;

						});

						this.maxValue = maxValue;

						this.buildHistogram(null, null, true, () => {
							setTimeout(() => {
								this.buildHistogram(null, null, null, ()=>{
									this.resizeDisabled = false;
									this.buildBrush();
								});
							}, 500);
						});
					}
				}

				window.startLoader();

				var options: any = {
					app: this.application,
					corridor: this.couloir
				}
				window.Database.getHistory(options, (data: Record[])=>{
						if(data.length > 0){
							data = this.parseInData(data);
						}

						setTimeout(()=>{
							this.dataBackup = JSON.stringify(data);
						},1);

						this.data = <Array<Record>> data;

						window.stopLoader();

						if(data.length > 0){
							this.chosen = true;
							this.noMatches = false;

							dataLoaded = true;
							next();
						}
						else{
							this.noMatches = true;
							this.chosen = false;
						}
				});
				/*this.http.get("api/history/"+this.application+"/"+this.couloir)
					.success((data:Array<Record>)=>{
						
						
					})
					.error(function(err:any){
						window.stopLoader();
						console.error("erreur à la récupération des données pour l'histogramme");
						console.error(err);
					});*/

				window.startLoader();
				var options : any = {
					app: this.application,
					corridor: this.couloir
				}
				window.Database.getTrend(options, (data:{[index:string]: Array<Record>})=>{
					var type: string;
					for(type in data){
						data[type] = this.parseInData(data[type]);
					}

					setTimeout(()=>{
						this.trendBackup = JSON.stringify(data);
					}, 1);

					this.trend = <{[index:string]: Array<Record>}> data;
					trendLoaded = true;

					window.stopLoader();
					next();

				})
				/*
				this.http.get("api/trend/"+this.application+"/"+this.couloir)
					.success()
					.error(function(err:any){
						window.stopLoader();
						console.error("erreur à la récupération du trend pour l'histogramme");
						console.error(err);
					});
				*/
			}
		}


		/**
			Initialise brush min and max date
		*/
		private initRangePicker = (): void => {
			var minDate : Date = new Date();
			minDate.setFullYear(minDate.getFullYear()-1);
			this.minDate = minDate;

			this.start = minDate;
			this.stop = new Date();
		}

		/**
			Parse data not parsed automaticaly by Angluar
		*/
		private parseInData = (data: Array<Record>) : Array<Record> =>{
			var tempStr: string;
			data.forEach(function(item: Record, inex: number){
				item.starttime = new Date(item.starttime);

				if(_.isString(item.value)){
					item.value = parseInt( String(item.value), 10);
				}
			});

			return data;
		}

		/**
			Trigger a full rebuild of the line chart width new min and max

			@param skipOtherDiagrams used to refresh the line chart without refreshing the others. This param is usefull for some reasons:
			* The biggest and slowest part of the code is used for the line chart construction.
			* Triggering one time a (at the page load) a construction of the diagramm allows the Javascript virtual machine to optimise the slowest pârts of the code.
			 The others charts ar fasts and do not need to be processed at the page loading.
		*/

		private updateHistogram = (bornes?: any, skipOtherDiagrams?: boolean): void=> {
			if(bornes){
				var min : any = bornes.values.min;
				var max : any = bornes.values.max;

				this.start = min;
				this.stop = max;
			}

			this.buildHistogram(null, skipOtherDiagrams);
		}

		/**
			Safe alias to updateHistogram with a public visibility
			@usedBy Angular
		*/
		public externalUpdateHistogram = (skipOtherDiagrams): void => {
			this.updateHistogram(null, skipOtherDiagrams);
		}

		/**
			Extract all the values between this.start and this.stop
		*/
		private filterData = (data: Array<Record>): Array<Record> => {
			

			var inf : number, sup: number;

			inf = this.findStartTimeSorted(data, this.start);
			sup = this.findStartTimeSorted(data, this.stop);

			return data.slice(inf, sup);
		}


		/**
			Find a value by recursive dichotomy on the date field
			
			@returns Value's position in data containing date date_recherche
			@returns nearest Value's position if date_recherche isn't found.
			@returns -1 if error
			
			@param array Data, sorted by date ascendingly
			@param date_recherche date to find
			@param start left boundary
			@param stop right boundary

			
		*/

		private findStartTimeSorted = (array: Array<Record>, date_recherche:any, start?: number, stop?:number): number => {
			if(!start && !stop){
				start = 0;
				stop = array.length - 1;
			}

			var centre : number  = Math.floor((stop-start)/2 + start);

			var arret: boolean = (stop-start) <= 1;

			var value: Record = array[centre];

			if(arret){
				if(value.starttime == date_recherche)
					return centre;
				else
				{
					var inf: Record = array[centre-1] || value;
					var centre_inf :number = centre-1;
					if(inf == value)
						centre_inf = centre;

					var sup: Record = array[centre+1] || value;
					var centre_sup: number = centre + 1; 
					if(sup == value)
						centre_sup = centre;

					var diff_inf = inf.starttime - value.starttime;
					var diff_sup = value.starttime - sup.starttime;

					if(diff_inf < diff_sup)
						return centre_inf
					else
						return centre_sup

				}
			}
			else{
				if(date_recherche < value.starttime)
					return this.findStartTimeSorted(array, date_recherche, start, centre);
				else if (date_recherche > value.starttime)
					return this.findStartTimeSorted(array, date_recherche, centre, stop);
				else
					return this.findStartTimeSorted(array, date_recherche, centre, centre);
			}



		}


		/**
			D3 linear scale for the brush width
		*/
		private scalerBrushX;

		/**
			jQuery object pointing to the brush element
		*/
		private brush; // sauvegarde des éléments de la brush.


		/**
			Build and draw the brush in the .brush element
		*/
		private buildBrush = (mustRefresh?: boolean): void => {

			var svg = d3.select('#histogram > .svg > svg ');

			var width: number = $('#histogram .svg').width() * 0.95;
			var height: number = 300;
			var margin : any ={
				top: 25,
				right: 30,
				bottom: 145,
				left: 60
			};


			var heightBrush = this.heightBrush;

			if(!this.scalerBrushX || mustRefresh){

				this.scalerBrushX = d3.time.scale()
					.domain([
						this.minDate,
						new Date()
					])
					.range([
						margin.left,
						(width-margin.right)
					]);
			}

			var axeBrushX = d3.svg.axis()
							 .scale(this.scalerBrushX)
							 .orient('bottom');
			var scalerBrushY = d3.scale.linear()
								.domain([
									(-(this.maxValue/10)),
									this.maxValue
								])
								.range([height+heightBrush*2 - 30, height+heightBrush]);
			if(!this.brush || mustRefresh){
				this.brush = d3.svg.brush()
								.x(this.scalerBrushX)
								.on('brush', ()=>{
									  var newDomain = this.brush.empty() ? this.scalerBrushX.domain() : this.brush.extent();
									  this.start = newDomain[0];
									  this.stop = newDomain[1];
									  this.updateHistogram();
								});
			}

			svg.selectAll('.brush .line').remove();
			var brushContainer = svg.selectAll('.brush');

			if(!brushContainer[0][0]){
				brushContainer = svg.append("g")
				  .attr("class", "brush")
				  .attr('transform','translate('+heightBrush+',0)');

				brushContainer.call(this.brush);

				brushContainer.selectAll("rect")
				  .attr("y", height+50)
				  .attr("height", heightBrush);

				brushContainer.append('g')
					.attr('class','x_axis_Brush axis')
					.attr('transform','translate(0,'+ (height+heightBrush+45) +')')
					.call(axeBrushX);
			}
			else{
				//alert('existe déjà!');
				//brushContainer.call(this.brush);
				brushContainer.selectAll('.x_axis_Brush.axis').call(axeBrushX);
			}
			if(mustRefresh){
				brushContainer.call(this.brush);
			}

			var brushDrawer = d3.svg.line()
								.interpolate(this.interpolation)
								.tension(this.tension)
								.x((record)=>{
									return this.scalerBrushX(record.starttime);
								})
								.y((record)=>{
									return scalerBrushY(record.value);
                                });

            

			for(var codeType in this.lignesSelectionees) {
				if(this.lignesSelectionees[codeType]){
					brushContainer.append('path')
                        .datum(this.unfilteredReports[codeType])
                        .attr('class', 'line')
                        .attr('d', brushDrawer)
                        .style('stroke', (report) => { return this.colorBuilder(codeType) });                    
				}
            }

           

            brushContainer.selectAll('.brushEventsContainer').remove();

            var eventsContainer = brushContainer
                .append('g')
                .attr('class', 'brushEventsContainer')
                .selectAll('rect')
                .data(this.filteredEvents);

            var eventsEnter = eventsContainer
                .enter()
                .append('rect')
                .attr('x', (event: Events.Event) => {
                	return this.scalerBrushX(event.start_time) 
                })
                .attr('y', height + 50)
                .attr('width', '1')
                .attr('height', heightBrush)
                .style('fill', 'red');// (event: Events.Event) => { return this.colorBuilder(event.codetype) });

            eventsContainer
                .exit()
                .remove();
            
            
		}

		/**
			Build and drow the line chart
			@param skipRendering execute without drawing the chart. Usefull to initilaise global values and to let the JIT compiler run
			without impatcting performances. Build the line chart isn't slow but SVG rendering is.
		*/
		private buildHistogram = (data?: Array<Record>, skipOtherDiagrams?: boolean, skipRendering?: boolean, optionalCallback? : ()=> void ) => {
			/*
				skipRendering semble être inutile mais que nenni!
				 A cause du parallèlisme il peut arriver que l'histogramme affiche des données en trop,
				 notemment celles du tableau qui n'on pas encore eu le temps d'etre marquées comme ne devant
				 pas être affichées

				 En appelant buildHistogram sans rendu on précalcule les données et on initialise les listeners
				 Comme le tri se fait pas accès direct et/ou dichotomie, cette étape n'est pas couteuse.
				 C'est la générationdu svg, et donc le rendu qui est lent.

				 De plus le compiateur JIT aura le temps de déterminer, en arrière plan, quoi faire de cette fonction.
			*/

			/**
				filtered data
			*/
			var fdata: Array<Record> = [];
			/**
				Filtered trend
			*/
			var ftrend: {[index:string]: Array<Record>};

			var target : JQuery =  this.histogram;
			var heightBrush = this.heightBrush;


			try{
				if(!data)
					data = this.data || [];

				if(data.length > 0)
					fdata =  this.filterData(data);

				ftrend = {};
				var type: string;
				for(type in this.trend){
					ftrend[type] = this.filterData(this.trend[type]);
				}

				this.fdata = fdata;


				if(!fdata || fdata.length === 0)
					throw('Exception forcée');
			}
			catch(err){
				console.log(err);
				if(target){
					target
						.find('g.root')
						.find('.line, root.trend, .trendReduced, .moyenne, circle')
						.remove();
				}

				var tableauVide: {[index:string]: Array<Record>} = {};
				setTimeout(()=>{
					if(!skipOtherDiagrams)
						this.buildTable(tableauVide);
				}, 1);

				this.messageHistogramme = "No data in this range.";


			}


			var reports: {[index:string]: Array<Record>} = {};

			var fftrend: {[index:string]: Array<Record>} = {};


			var active: boolean;
			fdata.forEach((report: Record, index: number) => {
				if(this.lignesSelectionees)
					active = this.lignesSelectionees[report.codetype]
				if(active == true || active == undefined) // important!
				{
					if(!reports[report.codetype])
						reports[report.codetype] = [];
					reports[report.codetype].push(report);
				}
			});

            var events: Array<Events.Event> = [];

			if(this.lignesSelectionees){


				var type: string;
				var choix : boolean;
				for(type in this.lignesSelectionees){
					choix = this.lignesSelectionees[type];
					if(choix){
						fftrend[type] = ftrend[type];
                        for (var i = 0; i < this.events.length; i++) {
                            if (this.events[i].codetype === type && this.events[i].type === 'tendance' ) {
                                events.push(this.events[i]);
                            }
                        }
					}

				}
			}
			else{
				fftrend = ftrend;
            }
            
            this.filteredEvents = events;

			var max: number = -Infinity;

			var codetype: string;
			var item: Record;
			for(codetype in reports){
				reports[codetype].forEach((item:Record)=>{
					if(item.value > max){
						max = item.value;
					}
				})
			}

			var pct: number = 1;
			var seuil: number = (max/100) * pct;

			var ffdata: Array<Record> = [];

			fdata.forEach((item: Record)=>{
				if(item.value > seuil)
					ffdata.push(item);
			});


			var plural_fdata: string;
			var plural_ffdata: string;

			if(fdata.length > 1)
				plural_fdata = 's';
			if(ffdata.length > 1)
				plural_ffdata = 's';

			this.messageHistogramme = fdata.length +" valus"+ plural_fdata;

			if(ffdata.length !== fdata.length){
				this.messageHistogramme += " including "+ (fdata.length-ffdata.length) +" too small"
					+ plural_ffdata + " to be shown"
					+"(<"+pct+"% -> "+seuil+")";
			}

			var first_value : Record = ffdata[0];
			var last_value : Record = ffdata[ffdata.length-1];

			/*
				Here our data are filtered. We can give them to the next chart (the table)
			*/


			if(!skipOtherDiagrams){
				setTimeout(()=>{
					this.buildTable(reports, ffdata);
				}, 1);
			}

			if(!skipRendering && data.length >0 ) {
				var thisClass : HistoryController = this;
				var $svg : JQuery = this.histogram.find('.svg > svg');
				//$svg.empty();
				var width: number = $('#histogram').find('.svg').width() * 0.95;
				var height: number = 300;
				var margin : any ={
					top: 25,
					right: 30,
					bottom: 145,
					left: 60
				};

				try{

					var scalerX: D3.Scale.TimeScale;
					scalerX = d3.time.scale()
						.domain([
							first_value.starttime,
							last_value.starttime
						])
						.range([
							margin.left,
							(width-margin.right)
						]);



					var scalerY: D3.Scale.LinearScale;
					scalerY = d3.scale.linear()
								.domain([
									(-(max/10)),
									max
								])
								.range([height, 0]);



					var axeX : D3.Svg.Axis;
					axeX = d3.svg.axis()
							 .scale(scalerX)
							 .orient('bottom');



					var axeY : D3.Svg.Axis;
					axeY = d3.svg.axis()
							 .scale(scalerY)
							 .orient('left');


					var svg: any = d3.select($svg.selector)
									 .attr('width', width+ margin.left + margin.right)
									 .attr('height', height + margin.top + margin.bottom);


					var diagram = svg.select('g.root');
					//console.log(diagram);
					if(!diagram[0][0]){
						diagram = svg.append('g')
							.attr('class', 'root')
							.attr('transform', 'translate('+margin.left+','+margin.top+')');
					}

					var x_axis = svg.selectAll('.x_axis.axis');
					if(x_axis[0][0]){
						x_axis.call(axeX);
					}
					else{
						diagram.append('g')
							.attr('class','x_axis axis')
							.attr('transform','translate(0,'+height+')')
							.call(axeX);
					}
					var y_axis = svg.selectAll('.y_axis.axis');
					if(y_axis[0][0]){
						y_axis.call(axeY);
					}
					else{
						diagram.append('g')
							.attr('class','y_axis axis')
							.call(axeY);
					}


					var line = d3.svg.line()
								.interpolate(this.interpolation)
								.tension(this.tension)
								.x((record)=>{
									return scalerX(record.starttime);
								})
								.y((record)=>{
									return scalerY(record.value);
								});

					var trend = d3.svg.area()
								.x((d)=>{ return scalerX(d.starttime) })
								.y((d)=>{ return scalerY(d.average + d.stddev) })
								.y1((d)=>{ return scalerY(d.average - d.stddev) });

					var moyenne = d3.svg.line()
									.interpolate('bundle')
									.tension(0.7)
									.x((d)=>{ return scalerX(d.starttime) })
									.y((d)=>{ return scalerY(d.average) });

					var trendReduis = d3.svg.area()
										.x((d)=>{ return scalerX(d.starttime) })
										.y0((d)=>{ return scalerY(d.average + (d.stddev/2)) })
										.y1((d)=>{ return scalerY(d.average - (d.stddev/2)) });

					var color = this.colorBuilder;

					var decalage : number = 0;

					var tailleCarre : number = 20;


					var legendeRect = diagram.selectAll('rect.legende-item')
									.data(d3.keys(reports));

					legendeRect
							.style('fill', (record)=>{ return this.colorBuilder(record) })
							.attr('x',(label,index)=>{ return 200*index })
							.attr('y',(label,index)=>{ 
								if(index%3 == 0)
									decalage += tailleCarre;
								return height + heightBrush + tailleCarre +decalage+5;
							});

					var legendeRectEnter = legendeRect
						.enter()
							.append('rect')
							.attr('class', 'legende-item')
							.transition()
							.style('fill', (record)=>{ return this.colorBuilder(record) })
							.attr('x',(label,index)=>{ return 200*index })
							.attr('y',(label,index)=>{ 
								if(index%3 == 0)
									decalage += tailleCarre;
								return height + heightBrush + tailleCarre + decalage+5;
							})
							.attr('width', tailleCarre)
							.attr('height', tailleCarre);

					legendeRect
						.exit()
						.transition()
						.style('opacity','0')
						.remove();

					decalage = 20;


					var legendeLabel = diagram.selectAll('text.legende-label')
										.data(d3.keys(reports));
					legendeLabel
					//	.transition()
					//	.attr('x',(label,index)=>{ return (200+tailleCarre)*index+tailleCarre*1.5 })
					//	.attr('y',(label,index)=>{ return height + tailleCarre*1.75 + heightBrush +decalage })
						.text((record)=>{ return record });

					legendeLabel.enter()
						.append('text')
						.attr('class', 'legende-label')
						.attr('x',(label,index)=>{ return (200+tailleCarre)*index+tailleCarre*1.5 })
						.attr('y',(label,index)=>{ return height + tailleCarre*1.75 + heightBrush +decalage  })
						.text((record)=>{ return record });

					legendeLabel
						.exit()
						.transition()
						.style('opacity','0')
						.remove();


					var $tooltip = d3.select('#tooltip');


					var trendList = [];

					trendList = _.toArray(fftrend);

					diagram.selectAll('path')
							.remove();


					for(var codeType in fftrend){
						var cible = diagram
						.datum(fftrend[codeType]);

						cible
						.append('path')
						.each( function(r){ this._current = r;} )
						.attr('class', 'trend')
						.attr('d', trend)
						.style('fill', (t)=>{ return color(codeType)})
						.style('stroke', (t)=>{ return color(codeType)});

						cible
						.append('path')					 
						.each( function(r){ this._current = r;} )
						.attr('class', 'trendReduced')
						.attr('d', trendReduis)
						.style('fill', (t)=>{ return color(codeType)})
						.style('stroke', (t)=>{ return color(codeType)});

						cible
						.append('path')
						.each( function(r){ this._current = r;} )
						.attr('class', 'moyenne')
						.attr('d', moyenne)
						.style('stroke', 'red');
					}



						for(var codeType in reports){
							diagram
								.append('path')
								.datum(reports[codeType])
									.attr('class', 'line')
									.attr('d', line)
									.style('stroke', (report)=>{ return color(codeType)});
						}


						var reportsList = _.flatten(_.toArray(reports));

						var circleRadius : number = 4;
						var $circles = diagram.selectAll('circle')
						.data(reportsList, (record)=>{
							if(record.value > seuil)
								return record.starttime
						});

						$circles.each(function(record){
							var $this = d3.select(this);
							var radius = parseInt($this.attr('r'));
							if( (radius > 0) && (radius < circleRadius) ){
								$this.attr('r','4');
							}
						});


						$circles//.transition()
							.attr('cx', (record)=> { return scalerX(record.starttime); })
							.attr('cy', (record)=> { return scalerY(record.value); })
							.style('fill', (record)=>{ return color(record.codetype); });
						$circles
							.enter()
							.append('circle')
							.attr('cx', (record)=> { return scalerX(record.starttime); })
							.attr('cy', (record)=> { return scalerY(record.value); })
							.style('fill', (record)=>{ return color(record.codetype); })
							.attr('r', '4')
							.on('mouseover', function(record){
								thisClass.histogramNomRapport = record.codetype;
								thisClass.histogramValeurRapport = record.value;
								thisClass.histogramDateRapport = record.starttime.toLocaleString().replace('UTC', '');

								thisClass.updateScope();

								$tooltip.transition()
									.duration(200)
									.style('opacity', 0.9)
									.style('left', (d3.event.pageX) + 'px')
									.style('top', (d3.event.pageY) + 'px');

								var $this = d3.select(this);

								$this.transition()
									 .duration(200)
									 .attr('r', 15)
									 .style('fill', thisClass.invertRGBColor($this.style('fill')))
									 .style('fill-opacity', '1');
							})
							.on('mouseout', function(record){
								$tooltip.transition()
									.duration(1000)
									.style('opacity', 0);

								d3.select(this).transition()
									.duration(200)
									.attr('r', 4)
									.style('fill', color(record.codetype))
									.style('fill-opacity', 0.6);
							});

						$circles.exit()
							//.transition()
							//.duration(750)
							//.attr('r', '0')
							.remove();

					

                diagram.selectAll('.diagramEventsContainer').remove();
                
                var eventsContainer = diagram
                    .append('g')
                    .attr('class', 'diagramEventsContainer')
                    .selectAll('line')
                    .data(this.filteredEvents);
                
                var eventsEnter = eventsContainer   
                    .enter()
                    .append('line')
                    .attr('x1', (event: Events.Event) => {return scalerX(event.start_time) })
                    .attr('x2', (event: Events.Event) => {return scalerX(event.start_time) })
                    .attr('y1', '0')
                    .attr('y2', height)
                    .style('stroke-width', '2')
                    .style('stroke-dasharray','2 5')
                    .style('stroke', 'red');// (event: Events.Event) => { return this.colorBuilder(event.codetype) });
                
                eventsContainer
                    .exit()
                    .remove();
                    

				}catch(err){
					console.warn(err.message);
					console.error(err);
				}
			}

			if(optionalCallback)
				optionalCallback();


            
			this.updateScope();

		}

		/**
			Initialize a Map for lignesSelectionees allowing to click on lines in the table
		*/
		private initLignesSelectionees = (stats) => {
			this.lignesSelectionees = {};

			var firstCall : boolean = true;
			for(var code in stats){
				if(firstCall){
					this.lignesSelectionees[code] = true;
					firstCall = false;
				}
				else
					this.lignesSelectionees[code] = false;
			}
		}

		/**
			Toggle the state (selected/unselected) of a line in the table.

			@param name error type

			@usedBy Angular ng-click in ng-repeat
		*/
		public select_ligne = (name: string) : void => {
			//for(var name in this.lignesSelectionees){
			//	this.lignesSelectionees[name] = false;
			//}
			this.lignesSelectionees[name] = !this.lignesSelectionees[name];
			setTimeout(()=>{
				this.updateHistogram();
				this.buildBrush();
			}, 10);

			this.updateScope();
		}


		/**
			Give an RGB color oposite color.  eg: [blue] <-> [orange]

			@param color string matching `rgb(x,y,z)`
			@returns string matching `rgba(i,j,k)`
		*/

		private invertRGBColor = (color:string) : string => {
			var rgb : any = [].slice.call(arguments).join(",").replace(/rgb\(|\)|rgba\(|\)|\s/gi, '').split(',')

			var max : number = rgb.length;

			for (var i = 0; i < max; i++){
				rgb[i] = ( i == 3 ? 1 : 255) - rgb[i];
			}
			return 'rgb(' + rgb.join(", ").replace(', NaN', '')+ ')';
		}


		/**
			Build a table filed with stats.
			Rendering is Angular's job

			@param data Deprecated should be removed carefully
			@param ffdata comming from buildHistogram method

			@usedBy buildHistogram private method
		*/
		private buildTable = ( data : {[index:string]: Array<Record>}, ffdata?: Record[] ): void => {

			var stats : {[index:string]: Statistique} = {};
			var liste: Statistique[] = [];

			var mapper : string[] = [];

			var total: number = 0;

			if(!ffdata)
				ffdata = [];

			ffdata.forEach((record: Record) => {
				total+= record.value;
				var s : Statistique = null;

				if(!stats[record.codetype]){
					mapper.push(record.codetype);
					s = new Statistique(record.codetype, record.value, record.http);
					stats[record.codetype] = s;
				}
				else{
					s = stats[record.codetype];
					s.addValue(record.value);
				}
			});

			if(!this.lignesSelectionees || window.objectSize(this.lignesSelectionees) == 0 ){
				this.initLignesSelectionees(stats);
			}

			var codetype: string;
			var statistique: Statistique;
			for(codetype in stats){
				statistique = stats[codetype];
				statistique.calculePourcentage(total);
				liste.push(statistique);
			}

			liste = _.sortBy(liste, (item: Statistique)=>{
				return -item.value;
			});

			for(codetype in this.lignesSelectionees){
				if(mapper.indexOf(codetype) == -1){
					liste.push(Statistique.fakeStat(codetype));
				}
			}

			this.tableau = liste;

			this.updateScope();

			setTimeout(()=>{
				this.buildPie(stats);
			},1);
		}



		/**
			Build a pie chart in the #pie element

			@param stats comming from buildTable private method
			@usedBy buildTable private method
		*/

		private buildPie = (stats: {[index:string]: Statistique}) :  void =>{
			var liste : Statistique[] = [];
			var total : number = 0;

			this.pieChartContainsHttpValues = false;

			var codetype : string, item: Statistique;
			for(codetype in stats){
				item = stats[codetype];
				if(this.lignesSelectionees[codetype]){
					
					var errValue = parseInt(item.value, 10);
					var httpValue = parseInt(item.http,10);

					
					if(_.isNaN(errValue) && httpValue > 0 ){
						this.pieChartContainsHttpValues = true;
						break;
					}
				}
			}

			//console.log(this.pieChartContainsHttpValues);
			this.pieChartType = (this.pieChartContainsHttpValues ? 'Calls': 'Err (%)');
			


			for(codetype in stats){
				item = stats[codetype];
				if(this.lignesSelectionees[codetype]){
					var num: any;
					if(this.pieChartContainsHttpValues){
						num = parseInt(item.http,10) || 0;
					}
					else{
						num = parseInt(item.pct_err, 10) || 0;
					}					
					if(num !== NaN)
						total+= num;

					liste.push(item);

				}
				else{
					delete stats[codetype];
				}
			}

			liste.forEach((item: Statistique)=>{
				item.computeErrPct(total);
			});

			var $target = $('#pie');
			var $svg = $target.find('svg');

			//$svg.empty();

			var width :number = $target.width();
			var height = width;
			var radius: number = width/2; // Math.min(width, height)


			var color = this.colorBuilder;

			var arc = d3.svg.arc()
						.outerRadius(radius)
						.innerRadius(radius/3);

			var pie = d3.layout.pie()
						.startAngle(0)
						.value((record)=>{
							
							return  (this.pieChartContainsHttpValues ? parseInt(record.http,10) : record.pct_err_total );
						});
						//.sort(null);

			//$('#pie .arc, #pie .pct').remove();
			//$('#pie .pct').remove();

			var svg = d3.select($svg.selector)
						.attr('width', width)
						.attr('height', height);

			var $root = svg.select('g.root')
				.attr('transform', 'translate('+(width/2)+','+(height/2)+')');




			var text :string = '0';
			if(liste.length > 0){
				if(this.pieChartContainsHttpValues) text = ''+ Math.round( parseInt(liste[0].pct) || 0 );
				else text = ''+ Math.round( parseInt(<any>liste[0].pct_err_total) || 0 );				
			}

			function interpolateText(d) {
		        var i = d3.interpolate(this.textContent, d),
		            prec = (d + "").split("."),
		            round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;

		        return function(t) {
		            this.textContent = Math.round(i(t) * round) / round;
		        };
		    }

			var $pct = $root.selectAll('text.pct')
				.data([text]);
			$pct
				.attr('dy', '.35em')
				.style('text-anchor', 'middle')
				.attr('transform', 'translate(0,0)')
				.text(text)
				.transition()
				.duration(400)
				.tween("text", interpolateText );

			$pct.enter()
				.append('text')
				.attr('class', 'pct')
				.text('0')
				.transition()
				.duration(1000)
				.text(text)
				.tween('text', interpolateText);

			$pct.exit().remove();

			var pieData = pie(liste);

			var premierPassage: boolean = true;
			var $arc = $root.selectAll('#pie .arc')
							.data(pieData);


			$arc.style('fill', (record)=>{ return color(record.data.raw_err)})
				.attr('centroid', (record)=>{ return arc.centroid(record)})
				.transition()
				.attrTween("d", function(a){
							var i = d3.interpolate(this._current, a);
							this._current = i(0);
							return function(t) {
							  return arc(i(t));
							};
						});




			
			var thisAlias = this;
			var $path = $arc
				.enter()
				.append('path')
				.attr('class', 'arc')
				.attr('d', arc)
				.each(function(d) { this._current = d; })
				.attr('centroid', (record)=>{ return arc.centroid(record)})
				.style('fill', (record)=>{ return color(record.data.raw_err)})
				.on('mouseenter', function(record){
					var $target = $(this).siblings('.pct');
					$target.fadeOut(150, function(){

						  var text = (thisAlias.pieChartContainsHttpValues ? record.data.pct : record.data.pct_err_total);
						  $target.text(Math.round(text));
						  $target.fadeIn(150);
					});
				});

			$arc.exit().remove();



						 

			$arc.exit()
				 .remove();

			var $text = $root.selectAll('text.label')
				.data(pieData);

			$text
				 .text((record)=>{ return record.data.err })
				 .transition()
				 .attr('dy', '.35em')
				 .style('text-anchor', 'middle')
				 .attr('transform', (record)=>{ return 'translate('+ arc.centroid(record) +')'})

			$text.enter()
				 .append('text')
				 .attr('class','label')
				 .attr('dy', '.35em')
				 .attr('transform', (record)=>{ return 'translate('+ arc.centroid(record) +')'})
				 .text((record)=>{ return record.data.err });
				 

			$text.exit()
				 .remove();

			this.updateScope();

		}


		/**
			Specify if the line chart is full-width or not
		*/
		private full : boolean = false;

		/**
			First call
			@should be translated !
				
			Use to replace the pie chart correctly after the line chart has be drawn.

			If this is the first call, the pie chart is translated to it's own origine point.

			This solve some css positioning (absolute/relative) problems on firefox & IE
		*/
		private premierAppel: boolean = true;
		public resizeHistogram = () => {

			var decalageHistogram;
			var offsetTarget: any;
			var distanceToTop = $('#anchor-pie-normal').offset().top;
			if(this.premierAppel){
				var offset = $('#anchor-pie-normal').offset();
				$('#pie').offset(offset);
				this.premierAppel = false;
				this.resizeHistogram();
			}
			else{

				if(!this.full){
					offsetTarget = $('#anchor-pie-full').offset();

					decalageHistogram = '100%';

					$('#pie ').animate({
						top: offsetTarget.top - distanceToTop,
						left: offsetTarget.left
					}, 500, ()=> {
						$('#histogram > .svg')
							.animate({
								width: decalageHistogram
							}, 'fast', ()=>{
								this.updateHistogram();
								this.buildBrush(true);
							});
					});
				}
				else{
					decalageHistogram = '75%';

					$('#histogram > .svg')
						.animate({
							width: decalageHistogram
						}, 500, ()=>{
							this.updateHistogram();
							this.buildBrush(true);

							offsetTarget = $('#anchor-pie-normal').offset();
							$('#pie ').animate({
								top: 0,//offsetTarget.top,
								left: offsetTarget.left
							});
						});
				}
				this.full = !this.full;

			}

		}

		/**
			Force angular to rewatch models
		*/
		private updateScope = () : void => {
			if(!this.scope.$$phase)
				this.scope.$apply();
		}


		/**
			Save the table as CSV
		*/
		public exportCSVTableau = (): void =>{
			var data = this.tableau;

			var csv: string = '';
			csv += "Rang;%erreur;Erreur;Appels;Échecs;%/Total\n";


			var SEP :string = ';';
			data.forEach((item, index)=>{
				csv+= index
					 +SEP
					 +item.pct_err
					 +SEP
					 +item.err.trim()
					 +SEP
					 +item.value
					 +SEP
					 +item.http
					 +SEP
					 +item.pct
					 +'\n';
			});

			var rawData: Blob = new Blob([csv], {type: 'text/csv'});

			var uri = URL.createObjectURL(rawData);

			var $link: JQuery = $('.btn-export-csv-tableau');
			$link.attr('href', uri);

			var filename = 'Choregraphie_table_stats';

			var date: string = new Date()
								.toLocaleString()
								.replace( /\//g , '-')
								.replace( /\s/g ,'_');

			filename += '_'+ date +'.csv';

			$link.attr('download', filename);
			/*
				On modifie les attributs du bouton sur lequel on est en train de
					cliquer
				La navigation est déclanchée un fois que la pile d'appel est vide
				Du coup nos modifications sont prisent en compte et le téléchargement
					se déclanche
			*/

		}

		/**
			Save the selected line chart values as CSV
		*/
		public exportCSVHistogramme = () : void => {
			var data = this.fdata;

			var csv: string = 'couloir;application;type;code;valeur;date\n';

			var SEP:string=';';
			data.forEach((item, index)=>{
				csv += item.couloir
						+SEP
						+item.codeapp
						+SEP
						+item.codetype
						+item.code
						+SEP
						+item.value
						+SEP
						+item.starttime.toJSON()
						+'\n';
			});

			var rawData: Blob = new Blob([csv], {type: 'text/csv'});
			var uri = URL.createObjectURL(rawData);

			var $link: JQuery = $('.btn-export-csv-histogramme');
			$link.attr('href', uri);

			var filename: string = 'Choregraphie_dump'+this.couloir+'~'+this.application;

			var date : string =  new Date()
									.toLocaleString()
									.replace(/\//g, '-')
									.replace( /\s/g, '_');
			filename +='_'+date+'.csv';

			$link.attr('download', filename);

		}



	}

// module end
}


(function(){
    window.ChoregraphieControllers.controller('historyController', ['$scope', '$http', '$routeParams', '$window', function ($scope, $http, $routeParams, $window) {

        var eventsController: Events.EventsController = new Events.EventsController($scope, $http, $routeParams, $window);
		$scope.vm = new HistoryModule.HistoryController($scope, $http, $routeParams, eventsController); // notre module dépend de scope, de http, des routes et des evenements
		//console.log($scope.vm);
	}]); 
})();