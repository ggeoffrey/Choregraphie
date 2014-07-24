/// <reference path="../node.d.ts" />

export class Api{

	private connector ;
	constructor(connector){
		this.connector = connector;
	}

	public getApplications(callback: any): void {
		this.connector.getApplications(callback);
	}

	public getCoridors(callback: Function): void {
		this.connector.getCoridors(callback);
	}

	public getEvents(callback: Function): void {
		this.connector.getEvents(callback);
	}
	public getOverviewData(callback: Function): void {
		this.connector.getOverviewData(callback);
	}
}




module.exports = function(connector){
	var api = new Api(connector);
	return api;
}