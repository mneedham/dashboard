var config = require('./config')
var util  = require('util'), spawn = require('child_process').spawn, exec = require('child_process').exec;
var Step = require('step');
var mongo = require('mongodb');
var fs = require('fs');
var http = require('http');

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

function toInt(value) {
  return parseInt(parseFloat(value));
}

function newLinesOfCodeFor(repository, commit, paths, fn) {
	linesOfCodeFor(repository, commit["hash"], paths, function(doc) {
		var db = new mongo.Db(config.mongo.database_name, new mongo.Server("localhost", 27017, {}));
		db.open(function(err, db) {
			db.collection(config.mongo.collection_name, function(err, collection) {		
				doc["time"] = commit.time;
				collection.insert(doc, function(err, docs) {
					console.log(new Date().toString() + ": Saving to database for " + commit["hash"]);
					db.close();
					fn(doc);
				});
			});
		});
	});			
}

function linesOfCodeFor(repository, hash, paths, fn) {
	exec('cd ' + repository + ' && git checkout -f ' + hash, function (error, stdout, stderr) {
		var doc = { hash : hash.toString() }
		Step(
		  log("Calculating lines of code for " + hash, function calculateLineCounts() {
		  	var group = this.group();
			paths.forEach(function(path) {
				exec('cd ' + repository + ' && find . -type f -regex ".*' + path + '.*\\.scala$" | xargs cat | wc -l', group());
			});
		  }), 
		  function gatherResults(err, lineCounts) {
			lineCounts.forEach(function(count, index) { doc[paths[index].split("/")[1]] = count.trim(); });
			fn(doc);
		  }
		);
	});
}

function loadStats(hash, callback) {
	var db = new mongo.Db(config.mongo.database_name, new mongo.Server("localhost", 27017, {}));
	db.open(function(err, db) {
		db.collection(config.mongo.collection_name, function(err, collection) {
			collection.find({'hash' : hash.toString()}, function(err, cursor) {
				cursor.nextObject(function(err, doc) {
					callback(doc, collection, db);										
				});
			});			
		});
	});	
}

function myFor(repository, commits, onCompletionFn) {
  var copyOfCommits = commits.slice(0);

  (function linesForOneHash() {
    var commit = copyOfCommits.shift();

    if(copyOfCommits.length == 0) {
      onCompletionFn();
    } else {
	  newLinesOfCodeFor(repository, commit, ["src/main", "test/unit", "test/integration", "test/functional", "test/shared", "test/system"], linesForOneHash);	
    }       	
  })();	
}

app.get('/', function(req, res){
  res.render('index.jade', { title: 'Dashboard' });
});

function log(message, fn) {
	return function logMe() {
		console.log(new Date().toString() + ": " + message);
		fn.apply(this, arguments);
	}
}

app.get('/git/update', function(req, res) {
  var gitRepositoryPath = "/tmp/" + new Date().getTime();
  Step(
	log("Resetting repository", function getRepositoryUpToDate() { exec('cd ' + config.git.repository + ' && git reset HEAD', this); }),
	log("Cloning repository", function cloneRepository() { exec('git clone ' + config.git.repository + ' ' + gitRepositoryPath, this); }),
    log("Getting line counts", function getGitEntries()   { exec('cd ' + gitRepositoryPath + ' && git log --pretty=format:"%H | %ad | %s%d" --date=raw', this) }),
    function handleResponse(blank, gitEntries) {
		var commits = [];
	    gitEntries.split('\n').forEach(function(item) {
			if(item != "") {
				var theSplit = item.split('|');
		     	commits.push({hash : theSplit[0].trim(), time : theSplit[1].trim().split(" ")[0]})	
		   	}
	 	});
	
	   myFor(gitRepositoryPath, commits, function() {
	   	exec('rm -rf ' + gitRepositoryPath, function() { 
	   		console.log(new Date().toString() + ": Deleting repository");
	   		res.send("finished");
	   	});
      });		
    }
  );	
});

app.get('/fake-go', function(req, res) {
	fs.readFile('go.txt', function(err, data) {
		res.attachment("data.csv");
		res.end(data, 'UTF-8');		
	});
});

app.get('/go/show', function(req, res) {
	// var site = http.createClient(8153, "172.18.20.31"); 
	// var request = site.request("GET", "/go/properties/search?pipelineName=main&stageName=build&jobName=build&limitCount=1000", {'host' : "172.18.20.31"});
	var site = http.createClient(3000, "localhost"); 
	var request = site.request("GET", "/fake-go", {'host' : "localhost"});	
	request.end();
    request.on('response', function(response) {
		var data = ""
    	response.setEncoding('utf8');
        response.on('data', function(chunk) {
       		data += chunk;
    	});
		response.on('end', function() {
			var lines = data.split("\n"), buildTimes = [];
			lines.forEach(function(line, index) {
				var columns = line.split(",");
				if(index != 0 && nonEmpty(columns[9]) && nonEmpty(columns[11]) && columns[3] == "Passed") {
					buildTimes.push({ start :  columns[9], end : columns[11]});
				}
			});
			res.contentType('application/json');
			res.send(JSON.stringify(buildTimes));			
		});
    });	
});

function nonEmpty(column) {
  return column !== "" && column !== undefined
}

app.get('/git/commits', function(req, res) {
	var db = new mongo.Db(config.mongo.database_name, new mongo.Server("localhost", 27017, {}));
	db.open(function(err, db) {
		db.collection(config.mongo.collection_name, function(err, collection) {
			collection.find({}, {'sort' : 'time'}, function(err, cursor) {
				cursor.toArray(function(err, docs) {
					db.close();
					res.contentType('application/json');	
				    res.send(JSON.stringify(docs));	
				});
			});			
		});
	});			
});

app.get('/git/pairs/:name', function(req, res) {
  var git = require('./lib/git.js');
  parseCommitsFromRepository(function(commits) {
    res.contentType('application/json');	
	res.send(JSON.stringify(git.pairsFor(commits, req.params.name)));    	
  });	
})

app.get('/git/pairs', function(req, res) {
  var git = require('./lib/git.js');
  parseCommitsFromRepository(function(commits) {
    res.contentType('application/json');	
	res.send(JSON.stringify(git.pairs(commits)));    	
  });	
})

app.get('/git/people', function(req, res) {  
  var git = require('./lib/git.js');
  parseCommitsFromRepository(function(commits) {
    res.contentType('application/json');	
	res.send(JSON.stringify(git.people(commits)));    	
  });	
})

app.get('/git/commits/by-time', function(req, res) {
  parseCommitsFromRepository(function(commits) {
	var timesOfDay = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "00"]
	
	function createTime(hour) {
		return hour + ":00:00 GMT+0100 (BST)"
	}
	
	var timeFunctions = {};
	for(var i=0; i < timesOfDay.length; i++) {
	  if(timesOfDay[i+1]) {	
		(function() {
			var begin = createTime(timesOfDay[i]);
			var end = createTime(timesOfDay[i+1]);
		    timeFunctions[begin + "-" + end]  = function(commitTime) { 
			  var inside = (new Date("1/1/2010 " + commitTime) >= new Date("1/1/2010 " + begin) && new Date("1/1/2010 " + commitTime) < new Date("1/1/2010 " + end));
			  return inside; 
			}			
		})();
    	
	  }
	}
	

	var counts = {};
	commits.forEach(function(commit) {
		for(var timeFunction in timeFunctions) {
			if(timeFunctions.hasOwnProperty(timeFunction)) {			
				if(!counts[timeFunction]) counts[timeFunction] = 0;
				if(timeFunctions[timeFunction](commit.time)) {
				  counts[timeFunction] += 1;	
				}
			}
		}
	});
	
	res.contentType('application/json');	
	res.send(JSON.stringify(counts));
	
  }); 	
});

function parseCommitsFromRepository(fn) {
	var gitRepositoryPath = "/tmp/core";
  Step(
	log("Resetting repository", function getRepositoryUpToDate() { exec('cd ' + config.git.repository + ' && git reset HEAD', this); }),
	log("Cloning repository", function cloneRepository() { exec('git clone ' + config.git.repository + ' ' + gitRepositoryPath, this); }),
    log("Parsing commits", function getGitEntries()   { exec('cd ' + gitRepositoryPath + ' && git log --pretty=format:"%H | %ad | %s%d" --date=raw', this) }),
    function handleResponse(blank, gitEntries) {
		var commits = [];
	    gitEntries.split('\n').forEach(function(item) {
			if(item != "") {
				var theSplit = item.split('|');		
				var date = theSplit[1].trim().split(" ")[0]*1000;		
		     	commits.push({message: theSplit[2].trim(), date: new Date(date).toDateString(), time : new Date(date).toTimeString()})
		   	}
	 	});	

       fn(commits);
    }
  );	
}

app.listen(3000);