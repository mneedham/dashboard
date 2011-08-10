var config = require('./config')
var util  = require('util'), spawn = require('child_process').spawn, exec = require('child_process').exec;
var Step = require('step');
var mongo = require('mongodb')

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

var gitRepositoryPath = '/tmp/testcore';

function toInt(value) {
  return parseInt(parseFloat(value));
}

function newLinesOfCodeFor(commit, paths, fn) {
	linesOfCodeFor(commit["hash"], paths, function(doc) {
		var db = new mongo.Db(config.mongo.database_name, new mongo.Server("localhost", 27017, {}));
		db.open(function(err, db) {
			db.collection(config.mongo.collection_name, function(err, collection) {		
				doc["time"] = commit.time;
				collection.insert(doc, function(err, docs) {
					console.log("saving doc: " + JSON.stringify(doc));
					db.close();
					fn(doc);
				});
			});
		});
	});			
}

function linesOfCodeFor(hash, paths, fn) {
	exec('cd ' + gitRepositoryPath + ' && git checkout -f ' + hash, function (error, stdout, stderr) {
		var doc = { hash : hash.toString() }
		Step(
		  function calculateLineCounts() {
		  	var group = this.group();
			paths.forEach(function(path) {
				exec('cd ' + gitRepositoryPath + ' && find . -type f -regex ".*' + path + '.*\\.scala$" | xargs cat | wc -l', group());
			});
		  }, 
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

function myFor(commits, onCompletionFn) {
  var copyOfCommits = commits.slice(0);

  (function linesForOneHash() {
    var commit = copyOfCommits.shift();

    if(copyOfCommits.length == 0) {
      onCompletionFn();
    } else {
	  newLinesOfCodeFor(commit, ["src/main", "test/unit", "test/integration", "test/functional"], function() {
	    linesForOneHash();
	  });	
    }       	
  })();	
}

app.get('/', function(req, res){
  res.render('index.jade', { title: 'Git Repository Stats' });
});

app.get('/git/update', function(req, res) {
  Step(
	function cloneRepository() { exec('git clone ' + config.git.repository + ' ' + gitRepositoryPath, this); },
    function getGitEntries()   { exec('cd ' + gitRepositoryPath + ' && git log --pretty=format:"%H | %ad | %s%d" --date=raw', this) },
    function handleResponse(blank, gitEntries) {
		var commits = [];
	    gitEntries.split('\n').forEach(function(item) {
			if(item != "") {
				var theSplit = item.split('|');
		     	commits.push({hash : theSplit[0].trim(), time : theSplit[1].trim().split(" ")[0]})	
		   	}
	 	});
	
	   console.log("calculating line counts...");
	   myFor(commits, function() {
	   	exec('rm -rf ' + gitRepositoryPath, function() { 
			console.log("deleting repository");
		    res.send("finished");
	 	});
      });		
    }
  );	
})

app.get('/git/show', function(req, res) {
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

app.listen(3000);