// <reference path="../../modules/socketManager/socket.io.d.ts" />

declare var io: any, LZString: any;


module Server {
	export class Database{


		private socket : any;

		constructor(){
			try{
				this.socket = io.connect();
			}
			catch(err){
				console.error(err);
			}
		}

		private decompress(lzEncodedBase64String: string ): any {
			return lzEncodedBase64String;
			//var decompressedJSON : string =  LZString.decompressFromBase64(lzEncodedBase64String);

			//console.log('Compression: '+ (Math.round(100-(lzEncodedBase64String.length/decompressedJSON.length)*100)) + '%');

			//return JSON.parse(decompressedJSON);
		}



		public getApplications( callback: Function ):void {
			this.socket.emit('getApplications', null, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}

		public getCorridors( callback: Function ):void {
			this.socket.emit('getCorridors', null, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}

		public getOverviewData( callback: Function ):void {
			this.socket.emit('getOverviewData', null, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
			
		}

		public getHistory( app:string, corridor:string, callback:Function): void {
			this.socket.emit('getHistory', {
				app: app,
				corridor: corridor
			}, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}
		public getTrend( app:string, corridor:string, callback:Function): void {
			this.socket.emit('getTrend', {
				app: app,
				corridor: corridor
			}, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}

		public getEvents( callback: Function ):void {
			this.socket.emit('getEvents', null, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}

		public setEvent( callback: Function, event: Events.Event ):void {
			this.socket.emit('setEvents', event, callback);
		}


		public getCalls(callback:Function): void{
			this.socket.emit('getCalls', null, (encodedData: string)=>{
				callback(this.decompress(encodedData));
			});
		}
	}
}


var Database = new Server.Database();