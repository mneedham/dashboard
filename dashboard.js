var http = require('http');
var fs = require('fs');
var util  = require('util'), spawn = require('child_process').spawn, exec = require('child_process').exec;
var Step = require('step');
var mongo = require('mongodb')

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

var gitOrigin = "/tmp/core";
var gitRepositoryPath = '/tmp/testcore';

var stats = {};

function toInt(value) {
  return parseInt(parseFloat(value));
}

function newLinesOfCodeFor(hash, paths, fn) {
	loadStats(hash, function(doc, collection, db) {
		if(doc) {
			fn(doc);
		} else {
			linesOfCodeFor(hash, "src/main", function(main) {
				linesOfCodeFor(hash, "test/unit", function(unit) {
					linesOfCodeFor(hash, "test/integration", function(integration) {
						linesOfCodeFor(hash, "test/functional", function(functional) {
							var newDoc = { "hash" : hash.toString(), "main" : toInt(main), "unit": toInt(unit), "integration": toInt(integration), "functional" : toInt(functional)  }
							collection.insert(newDoc, function(err, docs) {
								console.log("supposedly saving doc: " + newDoc);
								db.close();
								fn(newDoc);
							});
			            });
			        });
			     });
			});			
		}
	});
}

function linesOfCodeFor(hash, path, fn) {
	exec('cd ' + gitRepositoryPath + ' && git checkout -f ' + hash + ' && find . -type f -regex ".*' + path + '.*\\.scala$" | xargs cat | wc -l', function (error, stdout, stderr) {
		console.log("calculating " + hash);
		fn(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
		}
	});
}

function loadStats(hash, callback) {
	var db = new mongo.Db('git', new mongo.Server("localhost", 27017, {}));
	db.open(function(err, db) {
		db.collection('commits', function(err, collection) {
			collection.find({'hash' : hash.toString()}, function(err, cursor) {
				cursor.nextObject(function(err, doc) {
					callback(doc, collection, db);										
				});
			});			
		});
	});	
}

function myFor(hashes, onCompletionFn) {
  var jsonResponse = [];
  var copyOfHashes = hashes.slice(0);

  (function linesForOneHash() {
    var hash = copyOfHashes.shift();
    console.log(hash);

    if(copyOfHashes.length == 0) {
      onCompletionFn(jsonResponse);
    } else {
	  newLinesOfCodeFor(hash, ["src/main", "test/unit", "test/integration", "test/functional"], function(doc) {
	  	jsonResponse.push(doc);
	    linesForOneHash();
	  });	
    }       	
  })();	
}

app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site' });
});

app.get('/mongo', function(req, res) {
	var db = new mongo.Db('git', new mongo.Server("localhost", 27017, {}));
	db.open(function(err, db) {
		db.collection('commits', function(err, collection) {
			collection.insert([{'a':1}, {'a':2}, {'b':3}], function(err, docs) {
				db.close();
				res.contentType("text/html");
				res.send("hello moto");
			});			
		});
	});
});

app.get('/git-stats', function(req, res) {
  Step(function cloneRepository() { exec('git clone ' + gitOrigin + ' ' + gitRepositoryPath, this); },
       function getGitEntries()   { exec('cd ' + gitRepositoryPath + ' &&  git log --pretty=oneline | cut -d" " -f1 | head -n 100', this) },
       function handleResponse(blank, gitEntries) {
	     var hashes = [];
         gitEntries.split('\n').forEach(function(item, index) {
	       if(item != "") {
	        hashes.push(item);	
	       }  
         });

        myFor(hashes.reverse(), function(jsonResponse) {
	      exec('rm -rf ' + gitRepositoryPath, function() { console.log("deleting this bad boy") });
	      res.contentType('application/json');	
	      res.send(JSON.stringify(jsonResponse));		  
        }); }); 		
});

app.listen(3000);
