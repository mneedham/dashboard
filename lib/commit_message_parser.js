exports.parse = function(commitMessage){
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
	
    var pair = commitMessage.match(/(.*)[\/|,][ ]?([^ :]*)/);
	if(pair == null) {
		if(commitMessage.indexOf("Merge") !== -1) return [];
		var person = commitMessage.match(/([^ |:]*)/);		
		return [person[1].capitalise()];
	} else {
    	return [pair[1].capitalise(), pair[2].capitalise()];
	}
};
