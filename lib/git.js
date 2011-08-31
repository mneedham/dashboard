exports.parse = parse;
exports.hasPair = hasPair;
exports.Pair = Pair;

var pairRegex = /^\[?([a-zA-Z-]+)[ ]?[^\/, ]*[\/,][ ]?([a-zA-Z-]+)\]?[^\/]*[ :\t]/;
var bannedWordsRegex = /Revert/
var aliases = {"lix":"liz", "chrisj":"chris", "mustaq":"mushtaq", "mike":"michael", "micheal":"michael", "ducan":"duncan", "rw":"rob", "ld":"liz", "marcus":"mark"};

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
	var matches = !bannedWordsRegex.test(commitMessage) && pairRegex.test(commitMessage);
	if(!matches) {
		
		console.log(commitMessage);
	}
	return matches;
}

function Pair(pair) {
	function equals(otherPair) {
	  return (pair.person1 == otherPair.person1 && pair.person2 == otherPair.person2) || (pair.person1 == otherPair.person2 && pair.person2 == otherPair.person1);
	}
	
	function otherPerson(me) {
		if(me == pair.person1) {
			return pair.person2;
		}
		
		if(me == pair.person2) {
			return pair.person1;
		}
		return "Nobody";
	}
	
	pair.equals = equals;
	pair.otherPerson = otherPerson;
	return pair;
}

Array.prototype.uniqueEquals = function() {
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

Array.prototype.unique = function() {
    var a = [];
    var l = this.length;
    for(var i=0; i<l; i++) {
      for(var j=i+1; j<l; j++) {
        // If this[i] is found later in the array
        if (this[i] === this[j])
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
	    pairs[date] = pairs[date].uniqueEquals();
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
	
	var peoplePairedWith = {}
	for(var date in pairs) {
	  if(pairs.hasOwnProperty(date) && pairs[date].length > 0) {
	    // peoplePairedWith[date] = pairs[date].uniqueEquals();
	    var people = {};
	    pairs[date].forEach(function(pair) {
		  console.log(pair);
		  var otherPerson = pair.otherPerson(person)
		  if(!people[otherPerson]) {
		    people[otherPerson] = 0;
		  }
		  people[otherPerson] += 1;
	    });
	    peoplePairedWith[date] = people;
	  }
	}		
	
	return peoplePairedWith;
}

exports.people = function(commits) {
	var people = [];
	commits.forEach(function(commit) {
		if(hasPair(commit.message)) {
			var pair = parse(commit.message);
			people.push(pair.person1);
			people.push(pair.person2);
		}
	});
	return people.unique();
}