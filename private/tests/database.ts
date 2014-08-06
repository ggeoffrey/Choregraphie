
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
					Should(value).be.a.String;
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
					Should(value).be.a.String;
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
			this.timeout(30000);
			Database.getEvents(function(eventArray) {
				var event, next, random;
				random = Math.floor((Math.random() * eventArray.length + 1) / 1);
				event = eventArray[random];
				event.id = -1;
				next = function(result) {
					console.log;
					Should(result).not.be.ok;
					done();
				};
				Database.setEvent(next, event);
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


});