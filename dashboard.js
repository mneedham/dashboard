
var http = require('http');
var fs = require('fs');

var util  = require('util'), spawn = require('child_process').spawn;

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

function toInt(value) {
  return parseInt(parseFloat(value));
}

function linesOfCodeFor(hash, path, fn) {
  var find = spawn('find', ['/tmp/core', '-iname', '*.scala']),
	  ack = spawn('ack', [path]),
	  xargs = spawn('xargs', ['cat']),
	  count = spawn('wc', ['-l']);

  find.stdout.on('data', function (data) {
    ack.stdin.write(data);
  });

  find.on('exit', function (code) {
    ack.stdin.end();
  });

  ack.stdout.on('data', function (data) {
    xargs.stdin.write(data);
  });

  ack.on('exit', function (code) {
      xargs.stdin.end();
  });

  xargs.stdout.on('data', function (data) {
    count.stdin.write(data);
  });

  xargs.on('exit', function (code) {
    count.stdin.end();
  });

  count.stdout.on('data', function (data) {
    fn(data);
  });	
}

function myFor(hashes, eachHashFn, onCompletionFn) {
  var jsonResponse = [], hash = "525c5e2";

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
  myFor([], function() {}, function(jsonResponse) {
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
