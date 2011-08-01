
var http = require('http');
var fs = require('fs');
var util  = require('util'), spawn = require('child_process').spawn, exec = require('child_process').exec;
var Step = require('step');

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

var gitOrigin = "/tmp/core"
var gitRepositoryPath = '/tmp/testcore'

function toInt(value) {
  return parseInt(parseFloat(value));
}

function linesOfCodeFor(hash, path, fn) {
  var child = exec('cd ' + gitRepositoryPath + ' && git checkout -f ' + hash + ' && find . -type f -regex ".*' + path + '.*\\.scala$" | xargs cat | wc -l ', function (error, stdout, stderr) {
    fn(stdout);
	if (error !== null) {
	  console.log('exec error: ' + error);
	}
  });		
}

function myFor(hashes, onCompletionFn) {
  var jsonResponse = [];
  var copyOfHashes = hashes.slice(0);

  (function linesForOneHash() {
    var hash = copyOfHashes.shift();
    console.log(hash);
    
    linesOfCodeFor(hash, "src/main", function(main) {
      linesOfCodeFor(hash, "test/unit", function(unit) {
  	    linesOfCodeFor(hash, "test/integration", function(integration) {
  	      linesOfCodeFor(hash, "test/functional", function(functional) {
	        if(copyOfHashes.length == 0) {
		      onCompletionFn(jsonResponse);		      
	        } else {
			  jsonResponse.push({ "hash" : hash, "main" : toInt(main), "unit" : toInt(unit), "functional" : toInt(functional), "integration" : toInt(integration) });
			  linesForOneHash();		      
	        }  	        			
  	      });
  	    });
      });
    });    	
  })();	
}

app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site' });
});

app.get('/git-stats', function(req, res) {
  Step(function cloneRepository() { exec('git clone ' + gitOrigin + ' ' + gitRepositoryPath, this); },
       function getGitEntries() { exec('cd ' + gitRepositoryPath + ' &&  git log --pretty=oneline | cut -d" " -f1 | head -n 20', this) },
       function handleResponse() {
	     var gitEntries = arguments[1];
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
