/// <reference path="./socket.io.d.ts" />
/// <reference path="../api/api.d.ts" />

import socketIO = require('socket.io');

class SocketManager {

	
	private api: Api;
	private io : socketIO.SocketManager; 
	constructor(io: socketIO.SocketManager, api: Api ){
		this.io = io;
		this.api = api;

		this.listenToSockets();
	}

	private listenToSockets():void {
		this.io.on('connection', (socket)=>{
			socket.on('getApplications', (data:any, callback: Function)=>{
				this.api.getApplications(callback);
			});
			socket.on('getCoridors', (data:any, callback: Function)=>{
				this.api.getCoridors(callback);
			});
			socket.on('getEvents', (data:any, callback: Function)=>{
				this.api.getEvents(callback);
			});
			socket.on('getOverviewData', (data:any, callback: Function)=>{
				this.api.getOverviewData(callback);
			});
		});
	}

}


module.exports = SocketManager;