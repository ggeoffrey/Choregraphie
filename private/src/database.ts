// <reference path="../../modules/socketManager/socket.io.d.ts" />


/**
	Socket.io instance declared in *window* and casted to &lt;any&gt;.

	This declaration allows the socket.io usage without definition file.

	@usedBy Server.Database
*/
declare var io: any;

/**
	LZString instance declared in *window* and casted to &lt;any&gt;.

	This declaration allows the LZString usage without definition file.

	@usedBy Server.Database
*/
declare var LZString: any;


/**
	Everything concerning the server stands here.
*/
module Server {

	/**
		Database is on the server. This class is a proxy.
	*/
	export class Database{


		/**
			The socket.io instance
		*/
		private socket : any;



		/**
			Connect to the server and clear the local cache every 10 minutes.
		*/
		constructor(){
			try{
				this.socket = io.connect();
				setInterval(()=>{
					this.purgeCache();
				}, 600);
			}
			catch(err){
				console.error(err);
			}
		}

		/**	
			@param a JSON base64 LZ string   // JSON(base64(LZ))
			@returns an object parsed from json
		*/
		private decompress(lzEncodedBase64String: string ): any {
			//return lzEncodedBase64String;
			var decompressedJSON : string =  LZString.decompressFromBase64(lzEncodedBase64String);

			//console.log('Compression: '+ (Math.round(100-(lzEncodedBase64String.length/decompressedJSON.length)*100)) + '%');

			return JSON.parse(decompressedJSON);
		}


		/**
			Return an object from the cache if this object exists.
			@param flag  the object's name.
		*/
		private getFromCache(flag:string): any {
			var fromCache: any = sessionStorage.getItem(flag);
			if (fromCache){
				return this.decompress(fromCache);
			}
			else{
				return false;
			}
		}

		/**
			Store an object in cache. Clean alias to sessionStorage.setItem
			@param flag object's name
			@param object object to store
		*/
		private storeInCache(flag:string, object:any): void{
			sessionStorage.setItem(flag, object);
		}

		/**
			Remove an object by it's name in cache.

			Clean alias to sessionStorage.removeItem
			@param flag object's name
		*/
		public clearCache(flag: string): void{
			sessionStorage.removeItem(flag);
		}


		/**
			Clear all the cache
		*/
		private purgeCache() :void {
			sessionStorage.clear();
		}

		/**
			Get the applications list from Server or cache if available.

			Store the apps list in cache if possible.
		*/
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

		/**
			Try to add an application on server.
		*/
		public addApplication (app : string, callback : Function) : void {
			if(app && callback){
				this.socket.emit('addApplication', app, callback );
			}
			else{
				throw("Bad arguments");
			}
		}

		/**
			Try to delete an application on server
		*/
		public deleteApplication (app : string, callback : Function) : void {
			if(app && callback){
				this.socket.emit('deleteApplication', app, callback );
			}
			else{
				throw("Bad arguments");
			}
		}

		
		/**
			Same as getApplications, but for corridors
		*/
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

		/**
			Same as addApplication, but for corridors
		*/
		public addCorridor (corridor : string, callback : Function) : void {
			if(corridor && callback){
				this.socket.emit('addCorridor', corridor, callback );
			}
			else{
				throw("Bad arguments");
			}
		}



		/**
			Same as deleteApplication, but for corridors
		*/
		public deleteCorridor (corridor : string, callback : Function) : void {
			if(corridor && callback){
				this.socket.emit('deleteCorridor', corridor, callback );
			}
			else{
				throw("Bad arguments");
			}
		}



		/**
			Fetch overviewData from server

			@returns OverviewData object VIA callback
		*/
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

		/**
			@returns list of values VIA callback
		*/

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
		/**
			@returns list of values VIA callback
		*/
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

		/**
			@returns list of Events VIA callback
		*/
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

		/**
			Send an Event to the server. This event will be UPDATE-ED in the database.

			Just modify the event content and save it.

			@returns boolean VIA callback. TRUE -> events saved.
		*/
		public setEvent( callback: Function, event: Events.Event ):void {
			this.socket.emit('setEvents', event, callback);
		}



		/**
			@returns a Calls Tree object VIA callback
		*/
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

/**
	An instance of Server.Database available globaly.
*/
var Database = new Server.Database();