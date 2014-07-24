declare class Snap{
	constructor(any);
	open():void;
	close():void;
	expand(string):void;
	disable():void;
	enable():void;
	on(string, any):void;
	off(string):void;
	settings(any):void;
	state():any;
}