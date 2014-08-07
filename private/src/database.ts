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
			//return lzEncodedBase64String;
			var decompressedJSON : string =  LZString.decompressFromBase64(lzEncodedBase64String);

			console.log('Compression: '+ (Math.round(100-(lzEncodedBase64String.length/decompressedJSON.length)*100)) + '%');

			return JSON.parse(decompressedJSON);
		}


		private getFromCache(flag): any {
			var fromCache: any = sessionStorage.getItem(flag);
			if (fromCache){
				return this.decompress(fromCache);
			}
			else{
				return false;
			}
		}

		private storeInCache(flag, object): void{
			sessionStorage.setItem(flag, object);
		}

		private clearCache(flag: string): void{
			sessionStorage.removeItem(flag);
		}

		public getApplications( callback: Function ):void {
			var fromCache = this.getFromCache('applications');
			if(fromCache){
				callback(fromCache);
			}
			else{
				this.socket.emit('getApplications', null, (encodedData: string)=>{
					callback(this.decompress(encodedData));
					this.storeInCache('applications',encodedData);
				});				
			}
		}

		public getCorridors( callback: Function ):void {
			var fromCache = this.getFromCache('corridor');
			if(fromCache){
				callback(fromCache);
			}
			else{
				this.socket.emit('getCorridors', null, (encodedData: string)=>{
					callback(this.decompress(encodedData));
					this.storeInCache('corridor',encodedData);
				});
			}
		}

		public getOverviewData( callback: Function ):void {
			var fromCache = this.getFromCache('overview');
			if(fromCache){
				callback(fromCache);
			}
			else{
				this.socket.emit('getOverviewData', null, (encodedData: string)=>{
					callback(this.decompress(encodedData));
					this.storeInCache('overview',encodedData);
				});
			}			
		}

		public getHistory( options, callback:Function): void {
			if(!options || typeof options.app !== 'string' || typeof options.corridor !== 'string'){
				throw new Error('bad params for getHistory');
			}
			else{
				this.socket.emit('getHistory', options, (encodedData: string)=>{
					callback(this.decompress(encodedData));
				});				
			}
		}
		public getTrend( options, callback:Function): void {
			if(!options || typeof options.app !== 'string' || typeof options.corridor !== 'string'){
				throw new Error('bad params for getTrend');
			}
			else{
				this.socket.emit('getTrend', options, (encodedData: string)=>{
					callback(this.decompress(encodedData));
				});				
			}
		}

		public getEvents( callback: Function ):void {
			var fromCache = this.getFromCache('events');
			if(fromCache){
				callback(fromCache);
			}
			else{
				this.socket.emit('getEvents', null, (encodedData: string)=>{
					callback(this.decompress(encodedData));
					this.storeInCache('events',encodedData);
				});
			}
		}

		public setEvent( callback: Function, event: Events.Event ):void {
			this.socket.emit('setEvents', event, callback);
		}


		public getCalls(callback:Function): void{
			var fromCache = this.getFromCache('calls');
			if(fromCache){
				callback(fromCache);
			}
			else{
				this.socket.emit('getCalls', null, (encodedData: string)=>{
					callback(this.decompress(encodedData));
					this.storeInCache('calls',encodedData);
				});
			}
		}
	}
}


var Database = new Server.Database();