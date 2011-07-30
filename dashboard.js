
var http = require('http');
var fs = require('fs');

var util  = require('util'), spawn = require('child_process').spawn;

var express = require('express')
var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site' });
});

app.get('/git-stats', function(req, res) {
  var find = spawn('find', ['/tmp/core', '-iname', '*.scala']),
	  ack = spawn('ack', ['src/main']),
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
	  res.contentType('application/json');	
	  res.send(JSON.stringify([{ "hash" : "abcdfeff", "main" : parseInt(parseFloat(data)), "unit" : 200, "functional" : 300, "integration" : 100 },
							   { "hash" : "bcdefgaa", "main" : 45, "unit" : 200, "functional" : 300, "integration" : 100 },
							   { "hash" : "bcdefgaa", "main" : 47, "unit" : 200, "functional" : 300, "integration" : 100 }, 
							   { "hash" : "bcdefgaa", "main" : 49, "unit" : 200, "functional" : 300, "integration" : 100 }, 												 
							   { "hash" : "bcdefgaa", "main" : 52, "unit" : 200, "functional" : 300, "integration" : 100 }
							  ]));    
  });



 //find . -iname "*.scala" | cut -d":" -f1 | ack "src/main" | xargs cat | wc -l
						
});

app.listen(3000);
