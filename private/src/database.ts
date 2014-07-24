// <reference path="../../modules/socketManager/socket.io.d.ts" />

//import socketIO = require('socket.io');

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

		public getCoridors( callback: Function ):void {
			this.socket.emit('getCoridors', null, callback);
		}

		public getOverviewData( callback: Function ):void {
			this.socket.emit('getOverviewData', null, callback);
			
		}

		public getEvents( callback: Function ):void {
			this.socket.emit('getEvents', null, callback);
		}
	}
}


var Database = new Server.Database();