/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />
/// <reference path="../snap.d.ts" />
/// <reference path="../underscore.d.ts" />



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

        // Objects Groupper

        private grouper: any;

        // autres

        private selectedEvent: Event; // Evenement actuellement séléctionné. 



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

                if(!this.scope.$$phase) this.scope.$apply();
                
            });	
        }

        private parseData(): void {
            this.grouper = {};
            this.grouper['apps'] = {};
            this.grouper['couloirs'] = {};
            this.grouper['types'] = {};

            var length = this.events.length;
            var event: any;
            while (length--) {
                event = this.events[length];
                event.description = this.getDescriptionOf(event);


                event.start_time = new Date(event.start_time);

                if (!this.grouper['apps'][event.codeapp]) {
                    this.grouper['apps'][event.codeapp] = [];
                }
                this.grouper['apps'][event.codeapp].push(event);

                if (!this.grouper['couloirs'][event.couloir]) {
                    this.grouper['couloirs'][event.couloir] = [];
                }
                this.grouper['couloirs'][event.couloir].push(event);

                if (!this.grouper['types'][event.type]) {
                    this.grouper['types'][event.type] = [];
                }
                this.grouper['types'][event.type].push(event);
            }
        }

        /*public filterEvents(name: string, corridor: string, type: string, limit: number): Event[] {
            
            var newList: Array<Event> = [];

            // regexps

            var nameRegExp = new RegExp(name, 'gi');
            var corridorRegExp = new RegExp(corridor, 'gi');
            var typeRegExp = new RegExp(type, 'gi');


            // ----

            var length = this.events.length;
            var i = 0, event: Event = null, found  = 0;
            while(i < length && found < limit){
                event = this.events[i];
                // 
                var match : boolean = (
                    typeRegExp.test(event.type)
                    &&
                    nameRegExp.test(event.codeapp)
                    &&
                    corridorRegExp.test(event.couloir)

                );
                if(match){
                    newList.push(event);
                    found++;
                }
                i++;
            }

            newList.sort(function(a, b){
                return b.start_time.getTime() - a.start_time.getTime();
            });
            return newList;
        }*/

        public getStyleOf(event: Event): any {
            return {
                'background-color': this.colorBuilder(event.type),
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

        public selectEvent(event: Event) {
            if (this.selectedEvent) {
                this.selectedEvent.selected = false;
            }
            this.selectedEvent = event;
            this.selectedEvent.selected = true;
        }  

        public unSelectEvent(event: Event) {
            if (this.selectedEvent) {
                this.selectedEvent.selected = false;
            }
        }

        public setEventSeen(event: Event) {
            //window.startLoader();

            var confirm = function(success){
                if(!success){
                    event.selected = !event.selected;
                    if(!this.scope.$$phase) this.scope.$apply();
                }
            }

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

        public getByCouple(codeapp: string, couloir: string, callback: any) {
            if (!this.grouper) { // si le grouper n'est pas défini c'est qu'on est encor en chargement, on attends
                setTimeout(() => {
                    this.getByCouple(codeapp, couloir, callback);
                }, 50);
                
            }
            else {
                var retour: Array<Event> = [];
                var arr = this.grouper['apps'][codeapp];
                if (arr && arr.length && arr.length > 0) {
                    var position = arr.length;
                    while (position--) {
                        if (arr[position].couloir === couloir) {
                            retour.unshift(arr[position]);
                        }
                    }
                }
                callback(retour);
            }
        }

		public toggle = (): void => {
			this.window.toggleEvents();
		}
	}
// module end
}

(function(){
	window.ChoregraphieControllers.controller('eventsController', ['$scope', '$http', '$routeParams', '$window', function($scope, $http, $routeParams, $window){
		$scope.vm = new Events.EventsController($scope, $http, $routeParams, $window); // notre module dépend de scope et de http
	}]); 
})();