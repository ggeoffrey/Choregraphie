/// <reference path="../angular.d.ts" />
/// <reference path="../d3.d.ts" />
/// <reference path="../window.d.ts" />
/// <reference path="../snap.d.ts" />


/**
    Underscore instance declared in *window* and casted to &lt;any&gt;.

    This declaration allows the Underscore usage without definition file.

*/
declare var _ : any; // underscore



/**
    Manage Events
*/
module Events {

    /**
        Used to extract data from URL
    */
	interface RouteParams{
		codeapp: string;
		couloir: string;
    }

    /**
        This interface is **not** the Event object you have to implement in your server module.
        This interface is only used internaly.
    */
    export interface Event {
        /**
            ID comming from the database
        */
        id: number;
        /**
            Application name
        */
        codeapp: string;
        /**
            Corridor name
            @should be translated
        */
        couloir: string;
        /**
            Raw error code
        */
        codetype: string;
        /**
            Event's date
        */
        start_time: Date;
        /**
            Event has been acknowledged?
        */
        seen: boolean;
        /**
            Event is maked 'deleted' and should be hidden
        */
        deleted: boolean;

        /**
            Used for behaviour events [oldValue] -> [newValue]
        */
        oldValue: number;
        /**
            Classic or new value
        */
        value: number;
        /**
            standard deviation difference.
        */
        diffStddev: number;
        /**
            Event type
        */
        type: string;
        /**
            A string representation of this event
        */
        description: string;
        /**
            Event curretly selected ?
        */
        selected: boolean;
    }

    /**
        # Angular Controller
        Bound to the #/events view
    */
    export class EventsController {

		private scope: ng.IScope;
        /**
            @Deprecated
        */
		private http: ng.IHttpService;
		private routeParams: RouteParams;
		
        /**
            $window : Angular $window
        */
        private window: any;

        /**
            Events list
        */
        private events: Array<Event>;

        

        /**
            Used to color links by their types
            D3js scale.categoryXX();
        */
        private colorBuilder: any;

        //  ANGULAR FILTERS

        /**
            Angular filter. Managed by Angular.

            Filter Events by app name. Can be a RegExp
        */
        public nameFilter: string;
        /**
            Angular filter. Managed by Angular

            Filter Events by corridor name. Can be a RegExp
        */
        public corridorFilter: string;
        /**
            Angular filter. Managed by Angular

            Filter events by type. Used with a &lt;select&gt; element.
        */
        public typeFilter: string;
        /**
            Angular filter. Managed by Angular

            @WARN not implemented yet
        */
        public dateDirectionFilter: string;

        /**
            Angular filter. Managed by Angular

            Number of visible Events. Used with an &lt;input type="number" /&gt;
        */
        public limitShownFilter: number;
        
        // Objects Groupper

        /**
            Group Events by caracteristics to access theme quickly
        */
        private grouper: any;

        /**
            A filtered part of grouper.
        */
        public filteredGroup: any;

        /**
            Keys (Dates) of filteredGroup. Values are Dates in the time format : "1408979235077"

            This format allow ng-repeat to correctly sort the events list
        */
        public filteredGroupKeys: any;

        // autres

        /**
            Currently selected Event
        */
        public selectedEvent: Event;



        /**
            @param $http Deprecated
        */
		constructor($scope, $http, $routeParams, $window) {
			this.scope = $scope;
			this.http = $http;
			this.routeParams = $routeParams;
			this.window = $window;

            this.colorBuilder = d3.scale.category20();

            

			this.load();

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

        /**
            Fetch data from Database
        */
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

        /**
            Transform a raw event list to an Event list
        */
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
            
            // triggered to initialize variables
            this.filterEvents();
        }

        /**
            Use Angular filters to filter events and popular filteredGroup.
        */
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

        /**
            Give the style of an event depending of it's type
        */
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

        /**
            Get an understandable resume of an event.
            @should be translated
        */
        public getDescriptionOf(event: Event): string {
            var description: string = "";
            if (event.type === 'erreurs') {
                description += ": Unusual error amount";
            }
            else if (event.type === 'appels') {
                description += ": Unusual transactions amount";
            }
            else if (event.type === 'tendance') {
                description += "'s behaviour has changed";
            }
            return description;
        }

        /**
            Select an event
            @calledBy ng-click
        */
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


        /**
            Used to replace the bubble to it's original position
        */
        private unselectTimeout;

        /**
            Unselect an Event an replace the bubble.
        */
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

        /**
            Acknowledged an Event and save it to the Database
        */
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

        }


        /**
            Find an event by id and replace it's values with the new ones comming from the database.
        */
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

        /**
            Get a list of events for the couple APPxCorridor.
        */
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


        /**
            Force Angular to rewatch data change.
        */
        private forceUpdate(): void {
            if(!this.scope.$$phase) this.scope.$apply();
        }
	}
// module end
}


// binding to angular
(function(){
	window.ChoregraphieControllers.controller('eventsController', ['$scope', '$http', '$routeParams', '$window', function($scope, $http, $routeParams, $window){
		$scope.vm = new Events.EventsController($scope, $http, $routeParams, $window); // notre module dépend de scope et de http
	}]); 
})();