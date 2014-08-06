
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
});