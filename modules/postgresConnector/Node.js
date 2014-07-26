var Node = (function() {
  function Node(name, type, value) {
	this.name = name;
	this.type = type;
	this.value = parseInt(value, 10) || 0;
  }

  Node.prototype.add = function(value) {
  	this.value += parseInt(value, 10);
  };

  return Node;

})();

module.exports = Node;