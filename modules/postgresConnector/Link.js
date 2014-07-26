
var Link = (function() {
  function Link(call) {
	this.source = call.caller;
	this.target = call.called;
	this.value = call.value || 0;
	this.date = call.starttime;
  }

  Link.prototype.add = function(value) {
  	this.value += value;
  };

  return Link;

})();


module.exports = Link;