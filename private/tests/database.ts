
mocha.setup('bdd');

describe('Database', function(){
	it('should be ready in less than 5s', function(done){
		this.timeout(5000);
		window.Database.getApplications((data)=>{
			done();
			});
		});
	describe('decompress', function(){
		it('should be a Function', function(){
			Should(window.Database.decompress).be.a.Function;
			});
		it('should return an object decompressed from LZ algorithm', function(){
			var compressed = LZString.compressToBase64(JSON.stringify({yolo:'swag'}));
			var decompressed = window.Database.decompress(compressed);

			Should(decompressed.yolo).be.exactly('swag');
			
			});

		it('should throw an exception on bad params', function(){
			var func = window.Database.decompress.bind(null, null);
			Should(func).throw();
			});



		});
	describe('getApplication', function(){
		it('should be a Function', function(){
			Should(window.Database.getApplications).be.a.Function;
			});
		it('should return an array of strings', function(done){
			window.Database.getApplications((data)=>{
				Should(data).be.an.Array.and.not.empty;
				data.forEach((value)=>{
					Should(value).have.keys(['name', 'type']);
					});
				done();
				});
			});

		it('should throw an exception on bad params', function(){
			var func = window.Database.getApplications.bind(null, null);
			Should(func).throw();
			});

		});

	describe('getCorridors', function(){
		it('should be a Function', function(){
			Should(window.Database.getCorridors).be.a.Function;
			});
		it('should return an array of strings', function(done){
			window.Database.getCorridors((data)=>{
				Should(data).be.an.Array.and.not.empty;
				data.forEach((value)=>{
					Should(value).have.keys(['name', 'type']);
					});
				done();
				});
			});
		it('should throw an exception on bad params', function(){
			var func = window.Database.getCorridors.bind(null, null);
			Should(func).throw();
			});
		});

	

	describe('getEvents', function() {
		it('should be a Function', function() {
			Should(Database.getEvents).be.a.Function;
			});
		it('should return an array of Events ', function(done) {
			this.timeout(30000);
			Database.getEvents(function(eventArray) {
				
				var index, supposedEvent, _i, _len;
				Should(eventArray).be.an.Array.and.not.be.empty;
				done();
				});
			});
		it('should throw an exception on bad params ', function() {
			var next;
			next = function(result) {
				console.log(result);
			};
			Should(Database.getEvents.bind(null, null)).throw();
			});
		});

	describe('setEvent', function() {
		it('should be a Function', function() {
			Should(Database.setEvent).be.a.Function;
			});
		it('should return true on update success', function(done) {
			this.timeout(30000);
			Database.getEvents(function(eventArray) {
				var event, next, random;
				random = Math.floor((Math.random() * eventArray.length + 1) / 1);
				event = eventArray[random];
				next = function(result) {
					Should(result).be.ok;
					done();
				};
				Database.setEvent(next, event);
				});
			});
		it('should return false on update fail', function(done) {
			Database.getEvents(function(eventArray) {
				var event, next, random;
				random = Math.floor((Math.random() * eventArray.length + 1) / 1);
				event = eventArray[random];
				event.id = -1;
				next = function(result) {
					if(!result){
						done();
					}
					else{
						done(new Error('expecting Boolean(false) callback returned ('+result+')'));
					}
				};
				try{
					Database.setEvent(next, event);
				}
				catch(e){
					alert(e);
				}
				});
			});
		it('should throw an exception on bad params', function() {
			Database.getEvents(function(eventArray) {
				var event, next, random;
				random = Math.floor((Math.random() * eventArray.length + 1) / 1);
				event = eventArray[random];
				event.id = -1;
				event.seen = 'banana';
				next = function(value) {
					return value;
				};
				Should(Database.setEvent.bind(next, event)).should["throw"]();
				});
			});
		});
describe('getHistory', function() {
	it('should be a Function', function() {
		Should(Database.getHistory).be.a.Function;
		});
	it('should return an array of Values', function(done) {
		var next, options;
		options = {
			app: 'all',
			corridor: 'all',
			limit: 1000
		};
		next = function(valuesArray) {
			Should(valuesArray).be.an.Array;
			done();
		};
		Database.getHistory(options, next);
		});
	it('should return an empty array on inexistant params', function(done) {
		var next, options;
		options = {
			app: 'yolo',
			corridor: 'swag',
			limit: 1000
		};
		next = function(valuesArray) {
			Should(valuesArray).be.an.Array.and.be.empty;
			done();
		};
		Database.getHistory(options, next);
		});
	it('should throw an exception on bad params', function() {
		var next;
		next = function(valuesArray) {};
		Should(Database.getHistory.bind(null, next)).throw();
		});
	it('should throw an exception on bad callback', function() {
		Should(Database.getHistory.bind(null)).throw();
		});
	});

describe('getTrend', function() {
	it('should be a Function', function() {
		Should(Database.getTrend).be.a.Function;
		});
	it('getTrend should return an empty object on bad params', function(done) {
		var next, options;
		options = {
			app: 'all',
			corridor: 'all'
		};
		next = function(values) {
			Should(values).be.an.Object;
			done();
		};
		Database.getTrend(options, next);
		});
	it('getTrend should return an Object containing Values', function(done) {
		this.timeout(30000);
		var next, options;
		options = {
			app: 'VMIR',
			corridor: 'X_00'
		};
		next = function(values) {
			var item, key, value, _i, _len;
			try{
				Should(values).be.an.Object.and.not.be.empty;
				for (key in values) {
					value = values[key];
					Should(key).be.a.String;
					Should(value).be.an.Array;
					value.forEach(function(item){
						Should(item).be.an.Object;
						//Should(item).have.keys('somme', 'average', 'stddev','starttime');
						Should(item.somme).be.a.Number.and.be.greaterThan(-1);
						Should(item.average).be.a.Number.and.be.greaterThan(-1);
						Should(item.stddev).be.a.Number.and.be.greaterThan(-1);
						Should(item.starttime).be.a.Date;
						});
				}
				done();
			}
			catch(err){
				done(err);
			}
		};
		Database.getTrend(options, next);
		});
	it('should throw an exception on bad params', function() {
		Should(Database.getTrend.bind(null, null)).throw();
		});
	it('should throw an exception on bad params values', function() {
		var options;
		options = {
			yolo: 'swag'
		};
		Should(Database.getTrend.bind(null, null, options)).throw();
		});
	});

describe('getOverviewData', function() {
	it('should be a Function', function() {
		Should(Database.getOverviewData).be.a.Function;
		});
	it('should return an array', function(done) {
		Database.getOverviewData(function(data) {
			var item, _i, _len;
			Should(data).be.an.Array;
			for (_i = 0, _len = data.length; _i < _len; _i++) {
				item = data[_i];
				//Should(item).have.keys(['codeapp', 'couloir', 'codetype', 'start_time', 'value', 'sante', 'types']);
				Should(item.codeapp).be.a.String;
				Should(item.couloir).be.a.String;
				Should(item.codetype).be.a.String;
				Should(item.start_time).be.a.String;
				Should(item.value).be.a.String;
				Should(item.sante).be.a.Number;
				Should(item.types).be.an.Object;
			}
			done();
			});
		});
	it('should throw an exception on bad callback', function() {
		Should(Database.getOverviewData.bind(null, null))["throw"]();
		});
	});






});