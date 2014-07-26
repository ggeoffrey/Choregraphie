
function Call(app, codetype, hashtagSeparatedString , corridor, value, starttime ) {

	if(app === 'SFIS') this.caller = codetype.replace('nb_appelFI_', '');
	else this.caller= app;
	
	var values = hashtagSeparatedString.split('#');

	//this.number = value[0];

	this.called = values[1];
	this.service = values[2];
	this.method = values[3];
	this.version = values[4];

	this.corridor= corridor;
	this.value= parseInt(value, 10);
	this.starttime= starttime;
}


module.exports = Call;