[1mdiff --git a/modules/api/api.coffee b/modules/api/api.coffee[m
[1mindex c033662..13b8354 100644[m
[1m--- a/modules/api/api.coffee[m
[1m+++ b/modules/api/api.coffee[m
[36m@@ -30,13 +30,14 @@[m [mclass exports[m
     [m
 [m
     @getHistory :  (callback, options) ->[m
[31m-        if not callback? or typeof options.app isnt 'string' or typeof options.corridor isnt 'string'[m
[31m-            throw 'bad arguments'[m
[32m+[m
[32m+[m[32m        if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'[m
[32m+[m[32m            throw new Error('bad arguments')[m
         connector.getHistory(callback, false, options)[m
     [m
 [m
     @getTrend :  (callback, options) ->[m
[31m-        if not callback? or typeof options.app isnt 'string' or typeof options.corridor isnt 'string'[m
[32m+[m[32m        if not callback? or typeof options?.app isnt 'string' or typeof options?.corridor isnt 'string'[m
             throw 'invalid params'[m
         connector.getTrend(callback, false, options)[m
 [m
[36m@@ -46,6 +47,4 @@[m [mclass exports[m
         connector.getCalls(callback, false)[m
 [m
     [m
[31m-[m
[31m-[m
[31m-module.exports = exports[m
[32m+[m[32mmodule.exports = exports[m
\ No newline at end of file[m
[1mdiff --git a/modules/api/tests/api.coffee b/modules/api/tests/api.coffee[m
[1mindex 2e93783..1ee58f2 100644[m
[1m--- a/modules/api/tests/api.coffee[m
[1m+++ b/modules/api/tests/api.coffee[m
[36m@@ -77,7 +77,7 @@[m [mdescribe 'Api', ->[m
 			it 'should be a Function', ->[m
 				api.setEvent.should.be.a.Function[m
 [m
[31m-			it 'should return true', (done)->[m
[32m+[m			[32mit 'should return true on update success', (done)->[m
 				api.getEvents (eventArray)->[m
 					random = (Math.random() * eventArray.length + 1) // 1 # // -> Math.floor(x/y)[m
 					event = eventArray[random][m
[36m@@ -143,17 +143,23 @@[m [mdescribe 'Api', ->[m
 [m
 				api.getHistory next, options[m
 [m
[31m-			it 'should throw an exception on bad params',->[m
[32m+[m			[32mit 'should throw an exception on bad params', ->[m
 				[m
 				next = (valuesArray)->[m
 					console.log valuesArray[m
[31m-					done()[m
[32m+[m					[32mdone() if done?[m
[32m+[m
[32m+[m				[32moptions =[m[41m [m
[32m+[m					[32mapp: false[m
[32m+[m					[32mcorridor: {}[m
[32m+[m[41m				[m
[32m+[m				[32mapi.getHistory.bind(null, next).should.throw()[m[41m	[m
[32m+[m[41m				[m
 				[m
[31m-				api.getHistory.bind(null, next).should.throw()[m
 				[m
 [m
 			it 'should throw an exception on bad callback', ->[m
[31m-				api.getHistory.bind(null).should.throw()[m
[32m+[m				[32mapi.getHistory.bind(null, null, null).should.throw()[m
 [m
 		describe 'getTrend', ->[m
 			it 'should be a Function', ->[m
[36m@@ -179,7 +185,7 @@[m [mdescribe 'Api', ->[m
 					corridor : 'X_00'[m
 [m
 				next = (values)->[m
[31m-					values.should.be.an.Object.and.should.not.be.empty[m
[32m+[m					[32mvalues.should.be.an.Object.and.not.be.empty[m
 					for key, value of values[m
 						key.should.be.a.String[m
 						value.should.be.an.Array[m
[36m@@ -191,9 +197,9 @@[m [mdescribe 'Api', ->[m
 								'stddev'[m
 								'starttime'[m
 							][m
[31m-							item.somme.should.be.a.Number.and.greaterThan -1[m
[31m-							item.average.should.be.a.Number.and.greaterThan -1[m
[31m-							item.stddev.should.be.a.Number.and.greaterThan -1[m
[32m+[m							[32mitem.somme.should.be.a.Number.and.be.greaterThan -1[m
[32m+[m							[32mitem.average.should.be.a.Number.and.be.greaterThan -1[m
[32m+[m							[32mitem.stddev.should.be.a.Number.and.be.greaterThan -1[m
 							item.starttime.should.be.Date[m
 							[m
 					done()[m
[36m@@ -212,7 +218,7 @@[m [mdescribe 'Api', ->[m
 			it 'should be a Function', ->[m
 				api.getOverviewData.should.be.a.Function[m
 [m
[31m-			it 'should return an array', ->[m
[32m+[m			[32mit 'should return an array', (done)->[m
 				api.getOverviewData (data)->[m
 					data.should.be.an.Array[m
 					for item in data[m
[36m@@ -224,28 +230,45 @@[m [mdescribe 'Api', ->[m
 							'value'[m
 							'sante'[m
 							'types'[m
[32m+[m							[32m'resSante'[m
 						][m
 						item.codeapp.should.be.a.String[m
 						item.couloir.should.be.a.String[m
 						item.codetype.should.be.a.String[m
[31m-						item.start_time.should.be.a.String[m
[32m+[m						[32mitem.start_time.should.be.a.Date[m
 						item.value.should.be.a.String[m
[31m-						item.sante.should.be.a.String[m
[32m+[m						[32mitem.sante.should.be.a.Number[m
 						item.types.should.be.an.Object[m
[32m+[m					[32mdone()[m
 [m
 			it 'should throw an exception on bad callback', ->[m
 				api.getOverviewData.bind(null, null).should.throw()[m
[31m-###	[m
[32m+[m[41m		[m
[32m+[m
[32m+[m		[32mdescribe 'getCalls', ->[m
[32m+[m			[32mit 'should be a Function', ->[m
[32m+[m				[32mapi.should.have.property 'getCalls'[m
[32m+[m				[32mapi.getCalls.should.be.a.Function[m
[32m+[m
[32m+[m			[32mit 'getCalls should return a CallsTree', (done)->[m
[32m+[m				[32mapi.getCalls (callsTree)->[m
[32m+[m					[32mcallsTree.should.be.an.Object[m
[32m+[m
[32m+[m					[32mcallsTree.nodes.should.be.an.Object[m
[32m+[m					[32mcallsTree.links.should.be.an.Array[m
[32m+[m
[32m+[m					[32mfor key, node of callsTree.nodes[m
[32m+[m						[32mkey.should.be.a.String[m
[32m+[m						[32mnode.should.be.an.Object[m
[32m+[m						[32mnode.type.should.be.a.String[m
[32m+[m						[32mnode.name.should.be.a.String[m
 [m
[31m-		it 'getHistory should return  an array of objects', ->[m
[31m-			api.should.have.property 'getHistory'[m
[31m-			api.getHistory.should.be.a.Function[m
[32m+[m					[32mfor link in callsTree.links[m
[32m+[m						[32mlink.should.be.an.Object[m
[32m+[m						[32mlink.source.should.be.a.String[m
[32m+[m						[32mlink.target.should.be.a.String[m
 [m
[31m-		it 'getTrend should return  an array of objects', ->[m
[31m-			api.should.have.property 'getTrend'[m
[31m-			api.getTrend.should.be.a.Function[m
[32m+[m						[32mlink.value.should.be.a.Number[m
[32m+[m						[32mlink.date.should.be.a.Date[m
 [m
[31m-		it 'getCalls should return  a CallTree', ->[m
[31m-			api.should.have.property 'getCalls'[m
[31m-			api.getCalls.should.be.a.Function[m
[31m-###[m
\ No newline at end of file[m
[32m+[m					[32mdone()[m
\ No newline at end of file[m
[1mdiff --git a/modules/socketManager/SocketManager.coffee b/modules/socketManager/SocketManager.coffee[m
[1mindex 37deeef..e249e06 100644[m
[1m--- a/modules/socketManager/SocketManager.coffee[m
[1m+++ b/modules/socketManager/SocketManager.coffee[m
[36m@@ -6,9 +6,9 @@[m [mapi = require '../api'[m
 [m
 [m
 compress = ( object ) ->[m
[31m-	return object[m
[31m-	#json = JSON.stringify object[m
[31m-	#lzString.compressToBase64 json[m
[32m+[m	[32m#return object[m
[32m+[m	[32mjson = JSON.stringify object[m
[32m+[m	[32mlzString.compressToBase64 json[m
 [m
 [m
 class SocketManager[m
[36m@@ -52,7 +52,7 @@[m [mclass SocketManager[m
 [m
 			socket.on 'setEvents', (event, callback) ->[m
 				next = (result) ->[m
[31m-					if result?[m
[32m+[m					[32mif result? and result is true[m
 						socket.broadcast.emit('eventChanged', event)[m
 						socket.emit('eventChanged', event)[m
 						callback(true)[m
[1mdiff --git a/private/src/database.ts b/private/src/database.ts[m
[1mindex 6ad1fb8..7718cae 100644[m
[1m--- a/private/src/database.ts[m
[1m+++ b/private/src/database.ts[m
[36m@@ -9,6 +9,8 @@[m [mmodule Server {[m
 [m
 		private socket : any;[m
 [m
[32m+[m
[32m+[m
 		constructor(){[m
 			try{[m
 				this.socket = io.connect();[m
[36m@@ -19,56 +21,100 @@[m [mmodule Server {[m
 		}[m
 [m
 		private decompress(lzEncodedBase64String: string ): any {[m
[31m-			return lzEncodedBase64String;[m
[31m-			//var decompressedJSON : string =  LZString.decompressFromBase64(lzEncodedBase64String);[m
[32m+[m			[32m//return lzEncodedBase64String;[m
[32m+[m			[32mvar decompressedJSON : string =  LZString.decompressFromBase64(lzEncodedBase64String);[m
 [m
[31m-			//console.log('Compression: '+ (Math.round(100-(lzEncodedBase64String.length/decompressedJSON.length)*100)) + '%');[m
[32m+[m			[32mconsole.log('Compression: '+ (Math.round(100-(lzEncodedBase64String.length/decompressedJSON.length)*100)) + '%');[m
 [m
[31m-			//return JSON.parse(decompressedJSON);[m
[32m+[m			[32mreturn JSON.parse(decompressedJSON);[m
 		}[m
 [m
 [m
[32m+[m		[32mprivate getFromCache(flag): any {[m
[32m+[m			[32mvar fromCache: any = sessionStorage.getItem(flag);[m
[32m+[m			[32mif (fromCache){[m
[32m+[m				[32mreturn this.decompress(fromCache);[m
[32m+[m			[32m}[m
[32m+[m			[32melse{[m
[32m+[m				[32mreturn false;[m
[32m+[m			[32m}[m
[32m+[m		[32m}[m
[32m+[m
[32m+[m		[32mprivate storeInCache(flag, object): void{[m
[32m+[m			[32msessionStorage.setItem(flag, object);[m
[32m+[m		[32m}[m
 [m
 		public getApplications( callback: Function ):void {[m
[31m-			this.socket.emit('getApplications', null, (encodedData: string)=>{[m
[31m-				callback(this.decompress(encodedData));[m
[31m-			});[m
[32m+[m			[32mvar fromCache = this.getFromCache('applications');[m
[32m+[m			[32mif(fromCache){[m
[32m+[m				[32mcallback(fromCache);[m
[32m+[m			[32m}[m
[32m+[m			[32melse{[m
[32m+[m				[32mthis.socket.emit('getApplications', null, (encodedData: string)=>{[m
[32m+[m					[32mcallback(this.decompress(encodedData));[m
[32m+[m					[32mthis.storeInCache('applications',encodedData);[m
[32m+[m				[32m});[m[41m				[m
[32m+[m			[32m}[m
 		}[m
 [m
 		public getCorridors( callback: Function ):void {[m
[31m-			this.socket.emit('getCorridors', null, (encodedData: string)=>{[m
[31m-				callback(this.decompress(encodedData));[m
[31m-			});[m
[32m+[m			[32mvar fromCache = this.getFromCache('corridor');[m
[32m+[m			[32mif(fromCache){[m
[32m+[m				[32mcallback(fromCache);[m
[32m+[m			[32m}[m
[32m+[m			[32melse{[m
[32m+[m				[32mthis.socket.emit('getCorridors', null, (encodedData: string)=>{[m
[32m+[m					[32mcallback(this.decompress(encodedData));[m
[32m+[m					[32mthis.storeInCache('corridor',encodedData);[m
[32m+[m				[32m});[m
[32m+[m			[32m}[m
 		}[m
 [m
 		public getOverviewData( callback: Function ):void {[m
[31m-			this.socket.emit('getOverviewData', null, (encodedData: string)=>{[m
[31m-				callback(this.decompress(encodedData));[m
[31m-			});[m
[31m-			[m
[32m+[m			[32mvar fromCache = this.getFromCache('overview');[m
[32m+[m			[32mif(fromCache){[m
[32m+[m				[32mcallback(fromCache);[m
[32m+[m			[32m}[m
[32m+[m			[32melse{[m
[32m+[m				[32mthis.socket.emit('getOverviewData', null, (encodedData: string)=>{[m
[32m+[m					[32mcallback(this.decompress(encodedData));[m
[32m+[m					[32mthis.storeInCache('overview',encodedData);[m
[32m+[m				[32m});[m
[32m+[m			[32m}[m[41m			[m
 		}[m
 [m
[31m-		public getHistory( app:string, corridor:string, callback:Function): void {[m
[31m-			this.socket.emit('getHistory', {[m
[31m-				app: app,[m
[31m-				corridor: corridor[m
[31m-			}, (encodedData: string)=>{[m
[31m-				callback(this.decompress(encodedData));[m
[31m-			});[m
[32m+[m		[32mpublic getHistory( options, callback:Function): void {[m
[32m+[m			[32mif(!options || typeof options.app !== 'string' || typeof options.corridor !== 'string'){[m
[32m+[m				[32mthrow new Error('bad params for getHistory');[m
[32m+[m			[32m}[m
[32m+[m			[32melse{[m
[32m+[m				[32mthis.socket.emit('getHistory', options, (encodedData: string)=>{[m
[32m+[m					[32mcallback(this.decompress(encodedData));[m
[32m+[m				[32m});[m[41m				[m
[32m+[m			[32m}[m
 		}[m
[31m-		public getTrend( app:string, corridor:string, callback:Function): void {[m
[31m-			this.socket.emit('getTrend', {[m
[31m-				app: app,[m
[31m-				corridor: corridor[m
[