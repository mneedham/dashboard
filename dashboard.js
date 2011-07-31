
var http = require('http');
var fs = require('fs');

var util  = require('util'), spawn = require('child_process').spawn, exec = require('child_process').exec;

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

function toInt(value) {
  return parseInt(parseFloat(value));
}

function linesOfCodeFor(hash, path, fn) {
  var child = exec('cd /tmp/core && git checkout ' + hash + ' && find . -type f -regex ".*' + path + '.*\.scala$" | xargs cat | wc -l ',
	  function (error, stdout, stderr) {
	    fn(stdout);
	    if (error !== null) {
	      console.log('exec error: ' + error);
	    }
	});		
}

function myFor(hashes, eachHashFn, onCompletionFn) {
  var jsonResponse = [], hash = hashes.shift();

  linesOfCodeFor(hash, "src/main", function(main) {
    linesOfCodeFor(hash, "test/unit", function(unit) {
  	  linesOfCodeFor(hash, "test/integration", function(integration) {
  	    linesOfCodeFor(hash, "test/functional", function(functional) {
  		  jsonResponse.push({ "hash" : "abcdfeff", "main" : toInt(main), "unit" : toInt(unit), "functional" : toInt(functional), "integration" : toInt(integration) });
  	      jsonResponse.push({ "hash" : "abcdfeff", "main" : 3 + 40, "unit" : 2, "functional" : 5, "integration" : 4 });
  	      jsonResponse.push({ "hash" : "abcdfeff", "main" : 3 + 40, "unit" : 2, "functional" : 5, "integration" : 4 });
  	      onCompletionFn(jsonResponse);			
  	    });
  	  });
    });
  }); 	
}

app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site' });
});

app.get('/git-stats', function(req, res) {
  myFor(["525c5e2", "1052c2b", "a473ae1", "a7bd659", "a6eb471", "e255d69"], function() {}, function(jsonResponse) {
    res.contentType('application/json');	
    res.send(JSON.stringify(jsonResponse));
  });	
	
  // var jsonResponse = [], hashes = ["525c5e2", "1052c2b", "a473ae1", "a7bd659", "a6eb471", "e255d69"];
  // for(hash in hashes) {
  //   linesOfCodeFor(hash, "src/main", function(main) {
  //     linesOfCodeFor(hash, "test/unit", function(unit) {
  // 	    linesOfCodeFor(hash, "test/integration", function(integration) {
  // 	      linesOfCodeFor(hash, "test/functional", function(functional) {
  // 		    jsonResponse.push({ "hash" : "abcdfeff", "main" : toInt(main), "unit" : toInt(unit), "functional" : toInt(functional), "integration" : toInt(integration) });
  // 	  	    res.contentType('application/json');	
  // 		    res.send(JSON.stringify(jsonResponse));		
  // 	      });
  // 	    });
  //     });
  //   });
  // }

 //find . -iname "*.scala" | cut -d":" -f1 | ack "src/main" | xargs cat | wc -l
						
});

app.listen(3000);
