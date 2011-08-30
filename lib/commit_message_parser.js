exports.parse = parse;
exports.hasPair = hasPair;
exports.Pair = Pair;

var pairRegex = /^([a-zA-Z]+)[\/|,][ ]?([a-zA-Z]+)[ :]/;
var aliases = {"lix":"liz", "chrisj":"chris", "mustaq":"mushtaq", "mike":"michael"};

function parse (commitMessage){
	String.prototype.capitalise = function() {
		return this.charAt(0).toUpperCase() + this.slice(1);
	}
	
	for(var alias in aliases) {		
		if(aliases.hasOwnProperty(alias)) {
			commitMessage = commitMessage.toLowerCase().replace(alias, aliases[alias]);
		}
	}
	
	// commitMessage = commitMessage.toLowerCase().replace("lix", "liz").replace("chrisj", "chris");	
    var pair = commitMessage.match(pairRegex);
	if(pair !== null) {
    	return Pair({person1 : pair[1].capitalise(), person2 : pair[2].capitalise()});
	} else {
		console.log("unparseable commit message: " + commitMessage)
		return {};
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
        if (this[i].equals(this[j]))
          j = ++i;
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
	    pairs[commit.date].push(parse(commit.message));
	  }
	});	

	for(var date in pairs) {
	  if(pairs.hasOwnProperty(date)) {
	    pairs[date] = pairs[date].unique();
	  }
	}
	
	return pairs;
}

exports.pairsFor = function(commits, person) {
	var pairs = {};
	commits.forEach(function(commit) {		
	  if(hasPair(commit.message)) {
		var pair = parse(commit.message);
	    if(!pairs[commit.date]) {
	      pairs[commit.date] = [];
	    }
	
		if(pair.person1 == person || pair.person2 == person) {
		  pairs[commit.date].push(parse(commit.message));	
		}
	  }
	});
	
	var uniquePairs = {}
	for(var date in pairs) {
	  if(pairs.hasOwnProperty(date) && pairs[date].length > 0) {
	    uniquePairs[date] = pairs[date].unique();
	  }
	}		
	
	return uniquePairs;
}