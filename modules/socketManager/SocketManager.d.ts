/// <reference path="./socket.io.d.ts" />
/// <reference path="../api/api.d.ts" />

export declare class SocketManager {
	constructor(io: SocketManager, api: Api );
	listenToSockets():void;
}