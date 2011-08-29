exports.parse = parse;
exports.hasPair = hasPair;
exports.Pair = Pair;

var pairRegex = /^([a-zA-Z]+)[\/|,][ ]?([a-zA-Z]+)[ :]/

function parse (commitMessage){
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
	
    var pair = commitMessage.match(pairRegex);
	if(pair !== null) {
    	return [pair[1].capitalise(), pair[2].capitalise()];
	} else {
		console.log("unparseable commit message: " + commitMessage)
		return [];
	}
};

function hasPair(commitMessage) {
	return pairRegex.test(commitMessage);
}

function Pair(pair) {
	function equals(otherPair) {
		return (pair.person1 == otherPair.person1 && pair.person2 == otherPair.person2) || (pair.person1 == otherPair.person2 && pair.person2 == otherPair.person1);
	}
	
	pair.equals = equals;
	return pair;
}

Array.prototype.unique = function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
		console.log("init j:" + j);
		console.log("init i:" + i);
        if (this[i] === this[j])
          j = ++i;
		console.log("after j:"+ j);
		console.log("i:" + i);
      }
      a.push(this[i]);
    }
    return a;
};

exports.pairs = function(commits) {
	var pairs = {};
	commits.forEach(function(commit) {		
		if(hasPair(commit.message)) {
			if(!pairs[commit.date]) {
				pairs[commit.date] = [];
			}
			pairs[commit.date].push(Pair(parse(commit.message)));
		}
	});	

	// for(var date in pairs) {
	// 		if(pairs.hasOwnProperty(date)) {
	// 			pairs[date] = pairs[date].unique();
	// 		}
	// }
	
	return pairs;
}