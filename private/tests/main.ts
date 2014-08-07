declare var Should : any, mocha: any ;
declare var describe: Function, it: Function;


//mocha.checkLeaks();
/*mocha.globals([
	'jQuery',
	'snapperExpanded',
	'snapper',
	'__screenCapturePageContext__'
]);*/


class Obj {
	public one: number;
	private two: number;
	private yolo: string;
	constructor(){
		this.one = 1;
		this.two = 2;
		this.yolo = 'swag';
	}

	public getYolo() : string {
		return this.yolo;
	}
}


describe('Main', function(){
	describe('startLoader', function(){
		it('should be a Function', function(){
			Should(window.startLoader).be.a.Function;
		});
		it('should increment the calls counter when called ', function(){
			var loaderPreviousState = loadCount;
			window.startLoader();
			Should(loadCount).be.above(loaderPreviousState);
		});
	});

	describe('stopLoader', function(){
		it('should be a Function', function(){
			Should(window.stopLoader).be.a.Function;
		});
		it('should decrement the calls counter when called ', function(){
			var loaderPreviousState = loadCount;
			window.stopLoader();
			Should(loadCount).be.below(loaderPreviousState);
		});
	});


	describe('Array.prototype.forEach', function(){
		it('should be a Function', function(){
			Should(Array.prototype.forEach).be.a.Function;
		});

		it('should iterate over an array', function(){
			var array: Array<number> = [1,2,3,4,5];
			array.forEach(function(value, index){
				var indexOfValue = array.indexOf(value);
				Should(indexOfValue).be.exactly(index);
			});
		});
	});

	describe('window.objectSize', function(){

		it('should be a Function', function(){
			Should(window.objectSize).be.a.Function;
		});

		it('should give the size of raw objects', function(){
			var obj: any = {
				one: 1,
				two: 2,
				yolo: 'swag'
			};

			var size: number = window.objectSize(obj);
			Should(size).be.exactly(3);
		});
		it('should give the size of an instantiated objects', function(){
			var size: number = window.objectSize(new Obj());
			Should(size).be.exactly(3);
		});
	});

	


});