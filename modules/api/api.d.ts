/// <reference path="../node.d.ts" />
declare class Api {
    private connector;
    constructor(connector: any);
    getApplications(callback: Function): void
    getCoridors(callback: Function): void
    getEvents(callback: Function): void
    getOverviewData(callback: Function): void
}
