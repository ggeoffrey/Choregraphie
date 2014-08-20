/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />
/// <reference path="../snap.d.ts" />


declare var _ : any; // underscore



module Events {

	interface RouteParams{
		codeapp: string;
		couloir: string;
    }

    export interface Event {
        id: number;
        codeapp: string;
        couloir: string;
        codetype: string;
        start_time: Date; // string puis Date
        seen: boolean;
        deleted: boolean;
        oldValue: number;
        value: number;
        diffStddev: number;
        type: string;
        description: string;
        selected: boolean;
    }

    export class EventsController {

		private scope: ng.IScope;
		private http: ng.IHttpService;
		private routeParams: RouteParams;
		
        private window: any;

        private events: Array<Event>;
        public displayedEvents: Array<Event>;

        private colorBuilder: any; // D3.scale.categoryXX();

        //  ANGULAR FILTERS

        public nameFilter: string;
        public corridorFilter: string;
        public typeFilter: string;
        public dateDirectionFilter: string;
        public limitShownFilter: number;

        // Objects Groupper

        private grouper: any;
        public filteredGroup: any;
        public filteredGroupKeys: any;

        // autres

        public selectedEvent: Event; // Evenement actuellement séléctionné. 



		constructor($scope, $http, $routeParams, $window) {
			this.scope = $scope;
			this.http = $http;
			this.routeParams = $routeParams;
			this.window = $window;

            this.colorBuilder = d3.scale.category20();

            this.displayedEvents = [];

			this.init();

            window.Database.socket.on('eventChanged', (event)=>{
                this.updateEvent(event);
            });

            var $bubble = $('#bubble');

            $bubble.on('mouseover', (event)=>{
                event.preventDefault();
                event.stopPropagation();
                this.selectEvent(this.selectedEvent);
                this.forceUpdate();
            });
		}

		private init = (): void=>{
			this.load();
		}

		private load(): void {
            window.startLoader();
            window.Database.getEvents((data:any[])=>{
                
                if (_.isArray(data)) {
                    //sessionStorage.setItem('events', JSON.stringify(data));
                    this.events = data;//this.groupDataByApplication(data);
                }
                else {
                    this.events = [];
                }

                this.parseData();

                window.stopLoader();

                this.forceUpdate();
                
            });	
        }

        private parseData(): void {


            var length = this.events.length;
            var event: any;
            while (length--) {
                event = this.events[length];
                event.description = this.getDescriptionOf(event);
                event.start_time = new Date(event.start_time);
            }

            var apps = _.groupBy(this.events, function(event){ return event.codeapp });
            var corridors = _.groupBy(this.events, function(event){ return event.couloir });
            var type = _.groupBy(this.events, function(event){ return event.type });
            var date = _.groupBy(this.events, function(event){ return event.start_time });

            this.grouper = {
                apps: apps,
                corridors: corridors,
                types: type,
                date: date
            };
            
            this.filterEvents();
        }

        public filterEvents(): void { //  {[index:stringDate]: Event[]}
            var newGroup: any = {}; // {[index:stringDate]: Event[]}

            var limit = this.limitShownFilter || 100;
            // regexps

            var nameRegExp = new RegExp(this.nameFilter, 'gi');
            var corridorRegExp = new RegExp(this.corridorFilter, 'gi');
            var typeRegExp = new RegExp(this.typeFilter, 'gi');


            // ----

        
            var found : number = 0;
            _.each(this.grouper['date'], function( events: Event[], date: string ){
                var actualFoundEvents = found; // copy
                if(found < limit){
                    var key = moment(date).calendar();
                    newGroup[key] = [];
                    _.each(events, function(event: Event){
                        if(found < limit){
                            var match : boolean = (
                                typeRegExp.test(event.type)
                                &&
                                nameRegExp.test(event.codeapp)
                                &&
                                corridorRegExp.test(event.couloir)
                            );
                            if(match){
                                newGroup[key].push(event);
                                found++;
                            }                        
                        }
                    });

                    if(found === actualFoundEvents){ // no events where found at this date
                        delete newGroup[key];
                    }
                }
            });

            this.filteredGroup = newGroup;
            var keys = _.keys(newGroup);
            keys.sort(function(a, b){
                return new Date(b).getTime() - new Date(a).getTime();
            });
            this.filteredGroupKeys = keys;

        }

        public getStyleOf(event?: Event): any {

            if(event){
                return {
                    'background-color': this.colorBuilder(event.type),
                }
            }
            else if (this.selectedEvent) {
                return {
                    'background-color': this.colorBuilder(this.selectedEvent.type),
                }   
            }
        }

        public getDescriptionOf(event: Event): string {
            var description: string = "";
            if (event.type === 'erreurs') {
                description += ": Nbr d'erreurs inhabituel";
            }
            else if (event.type === 'appels') {
                description += ": Nbr de transactions inhabituel";
            }
            else if (event.type === 'tendance') {
                description += " a changé de comportement";
            }
            return description;
        }

        public selectEvent(event: Event, $event?: any) {
            if(this.unselectTimeout){
                clearTimeout(this.unselectTimeout);
            }
            if (this.selectedEvent) {
                this.selectedEvent.selected = false;
            }
            this.selectedEvent = event;
            

            if ($event) {
                var $bubble = $('#bubble');
                var $target = $($event.currentTarget);
                var newOffset = $target.offset();

                newOffset.left += ($target.width() / 4) * 3;
                
                
                newOffset.top += ($target.height() - $bubble.height() / 2) - $('#container').offset().top;
                $bubble.css('z-index', 999);
                $bubble.stop().clearQueue().animate(newOffset, 'fast');
            }

            this.selectedEvent.selected = true;
            this.forceUpdate();
        }


        private unselectTimeout;

        public unSelectEvent(event: Event) {
            if (this.selectedEvent) {
                this.selectedEvent.selected = false;
            }
            var $bubble = $('#bubble');
            var $anchor = $('.bubble-anchor');
            var anchorOffset = $anchor.offset();
            anchorOffset.top -= $('#container').offset().top;
            //anchorOffset.top -= $bubble.height()/2;
            anchorOffset.left += $bubble.width() / 2;
            this.unselectTimeout = setTimeout(function () {
                $bubble.animate(anchorOffset, 'fast', function () {
                    $bubble.css('z-index', -1);
                });
            }, 1000);
        }

        public setEventSeen() {
            //window.startLoader();

            var event = this.selectedEvent;
            var confirm = function(success){
                if(!success){
                    event.selected = !event.selected;
                    this.forceUpdate();
                }
            }


            event.seen = !event.seen;
            window.Database.setEvent(confirm, event);

            /*this.http.get('api/set/events?action=seen&target='+event.id+'&value='+event.seen)
                .success((data: any) => {
                    console.log(data);

                    window.stopLoader();
                })

                .error((err) => {
                    console.error("Event.seen -> impossible de metter à jour");
                    console.error(err);
                    window.stopLoader();
                });		*/
        }

        private updateEvent(newEvent: Event){
            newEvent.start_time = new Date(<any>newEvent.start_time);
            var length = this.events.length;
            var stop = false;
            var event: Event;
            while(length-- && !stop){
                event = this.events[length];
                newEvent.selected = false;
                if(this.selectedEvent == event) this.selectedEvent.selected = false;
                if(event.id === newEvent.id){
                    this.events[length] = newEvent;
                    stop = true;
                }
            }

            if(!this.scope.$$phase){
                this.scope.$apply();
                window.Database.clearCache('events');
            }
            
        }

        public getByCouple(codeapp: string, corridor: string, callback: any) {
            if (!this.grouper) { // si le grouper n'est pas défini c'est qu'on est encor en chargement, on attends
                setTimeout(() => {
                    this.getByCouple(codeapp, corridor, callback);
                }, 50);
                
            }
            else {
                var ret: Array<Event> = [];
                var arrApp = this.grouper['apps'][codeapp];
                var arrCorridor = this.grouper['corridors'][corridor];
                ret = <any>_.intersection(arrApp, arrCorridor);
                callback(ret);
            }
        }

		public toggle = (): void => {
			this.window.toggleEvents();
		}


        private forceUpdate(): void {
            if(!this.scope.$$phase) this.scope.$apply();
        }
	}
// module end
}

(function(){
	window.ChoregraphieControllers.controller('eventsController', ['$scope', '$http', '$routeParams', '$window', function($scope, $http, $routeParams, $window){
		$scope.vm = new Events.EventsController($scope, $http, $routeParams, $window); // notre module dépend de scope et de http
	}]); 
})();