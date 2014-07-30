// <reference path="../../modules/socketManager/socket.io.d.ts" />

declare var io: any;


module Server {
	export class Database{


		private socket : any;

		constructor(){
			this.socket = io.connect();
		}

		public getApplications( callback: Function ):void {
			this.socket.emit('getApplications', null, callback);
		}

		public getCorridors( callback: Function ):void {
			this.socket.emit('getCorridors', null, callback);
		}

		public getOverviewData( callback: Function ):void {
			this.socket.emit('getOverviewData', null, callback);
			
		}

		public getHistory( app:string, corridor:string, callback:Function): void {
			this.socket.emit('getHistory', {
				app: app,
				corridor: corridor
			}, callback);
		}
		public getTrend( app:string, corridor:string, callback:Function): void {
			this.socket.emit('getTrend', {
				app: app,
				corridor: corridor
			}, callback);
		}

		public getEvents( callback: Function ):void {
			this.socket.emit('getEvents', null, callback);
		}

		public setEvent( event: Events.Event ):void {
			this.socket.emit('setEvents', event);
		}


		public getCalls(callback:Function): void{
			this.socket.emit('getCalls', null,  callback);
		}
	}
}


var Database = new Server.Database();