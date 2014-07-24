/// <reference path="../node.d.ts" />
/// <reference path="./pg.d.ts" />
/// <reference path="./config.d.ts" />

import pg = require('pg');



export class PostgresConnector {

	private config: IDBConfig;

	private connectionString : string;

	private client : pg.Client;

	constructor(config : IDBConfig ){
		this.config = config;

		this.connectionString = "postgres://"+config.user;
		if(config.pass){
			this.connectionString += ':'+config.pass;
		}
		this.connectionString += "@"+config.host+"/"+config.databaseName;

		
	}

	private getClient( callback: any ) : void {
		pg.connect(this.connectionString, (err, client, done)=>{
			if(err){
				console.warn(err);
			}
			else{
				callback(client);
			}
		});
	}


	public getApplications( callback: any ) : void {
		var queryText : string  = "SELECT distinct codeapp "
								+ "FROM ccol.appli "
								+ "ORDER BY codeapp";

		this.getClient(function(client){
			var query : pg.Query =  client.query(queryText);

			var result : string[] = [];

			query.on('row', function(row){
				result.push(row.codeapp);
			});

			query.on('end', function(){
				console.log('end');
				callback(result);
			});

			query.on('error', function(err){
				console.warn(err);
			});
		});

		
	}

	public getCoridors( callback: Function ) : void {
		var queryText : string  = "SELECT distinct couloir "
								+ "FROM ccol.appli "
								+ "ORDER BY couloir";

		this.getClient(function(client){
			var query : pg.Query =  client.query(queryText);

			var result : string[] = [];

			query.on('row', function(row){
				result.push(row.couloir);
			});

			query.on('end', function(){
				console.log('end');
				callback(result);
			});

			query.on('error', function(err){
				console.warn(err);
			});
		});

		
	}

	public getEvents( callback: Function ) : void {
		var queryText : string  = "SELECT * "
								+ "FROM ccol.metric_events "
								+ "ORDER BY start_time DESC";

		this.getClient(function(client){
			var query : pg.Query =  client.query(queryText);

			var result : string[] = [];

			query.on('row', function(row){
				result.push(row);
			});

			query.on('end', function(){
				console.log('end');
				callback(result);
			});

			query.on('error', function(err){
				console.warn(err);
			});
		});

		
	}

	public getOverviewData( callback: Function ) : void {
		var queryText : string  = ""
            +" SELECT mv.codeapp, mv.couloir, mv.codetype, mv.start_time, SUM(mv.value) AS value, ms.sante"
            +" FROM metric_value mv,  metric_stats ms"
            +" WHERE mv.couloir LIKE 'X_%'"
            +" AND mv.couloir = ms.couloir"
            +" AND mv.codeapp = ms.codeapp"
            +" AND mv.start_time >= ( SELECT max(start_time) as start_time from metric_stats )"
            +" AND mv.start_time::date = ms.start_time::date"
            +" GROUP by mv.couloir, mv.codeapp, mv.codetype, mv.start_time, ms.sante;"
        ;

		this.getClient(function(client){
			var query : pg.Query =  client.query(queryText);

			var result : string[] = [];

			query.on('row', function(row){
				result.push(row);
			});

			query.on('end', function(){
				console.log('end');
				groupByApplication(result);
			});

			query.on('error', function(err){
				console.warn(err);
			});
		});


		function computeAbsMax( array : number[] ) : number {
			var max = -Infinity; // - Infinity
		    var absVal = 0;

		    var length = array.length;
		    while(length--){
		        absVal = Math.abs(array[length]);
		        if(absVal > max) max = absVal;
		    }

		    return max;
		}


		function groupByApplication( data: any ){

			var mapper = {};
			var listResult = [];
			var types = {};


			if( data.length ) {
				var length = data.length;
				var item;
				while(length--){
					item = data[length];

					types[item.codetype] = item.codetype;

					if(!mapper[item.codeapp]){
						mapper[item.codeapp] = item;
						item.detailSante = [];
						item.types = {};
					}

					if(!mapper[item.codeapp].types[item.codetype]){
		                var typeStat = {
		                	value: 0,
		                	detailSante : [],
		                	resSante: null,
		                };

		                mapper[item.codeapp].types[item.codetype] = typeStat;
		            }

		            mapper[item.codeapp].types[item.codetype].value += parseInt(item.value);
		            mapper[item.codeapp].types[item.codetype].detailSante.push(item.sante);
		            mapper[item.codeapp].detailSante.push(item.sante);
				}



				for(var codeapp in mapper){
					item = mapper[codeapp];
					var absMax = null;
		            for ( var codetype in item.types ) {
		            	var stats = item.types[codetype];
		                mapper[codeapp].types[codetype].resSante = computeAbsMax(stats.detailSante);
		                delete mapper[codeapp].types[codetype].detailSante;
		            }

		            for ( var codetype in types ){
		                if(mapper[codeapp].types && !mapper[codeapp].types[codetype]){
		                    mapper[codeapp].types[codetype] = {
		                        'value' : 0,
		                        'detailSante' : [],
		                        'resSante' : null
		                    };
		                }
		            }
		            mapper[codeapp].resSante = computeAbsMax(item.detailSante);
		            delete mapper[codeapp].detailSante;

		            listResult.push(mapper[codeapp]);
				}
				callback(listResult);
			}
		}		
	}	
}



module.exports = PostgresConnector;