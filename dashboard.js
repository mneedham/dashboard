
var http = require('http');
var fs = require('fs');
var express = require('express')

var app = express.createServer();
app.register('.html', require('jade'));
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res){
  res.render('index.jade', { title: 'My Site' });
});

app.get('/git-stats', function(req, res) {
  res.contentType('application/json');	
  res.send(JSON.stringify([{ "abcdfeff" : { "main" : 40, "unit" : 200, "functional" : 300, "integration" : 100 } },
						   { "bcdefgaa" : { "main" : 45, "unit" : 200, "functional" : 300, "integration" : 100 } },
						   { "bcdefgaa" : { "main" : 47, "unit" : 200, "functional" : 300, "integration" : 100 } }, 
						   { "bcdefgaa" : { "main" : 49, "unit" : 200, "functional" : 300, "integration" : 100 } }, 												 
						   { "bcdefgaa" : { "main" : 52, "unit" : 200, "functional" : 300, "integration" : 100 } }
						  ])) ;
						
});

app.listen(3000);


// http.createServer(function (req, res) {
// //  res.writeHead(200, {'Content-Type': 'text/plain'});
// //  parseCsvFile('/private/tmp/foo.txt', function(rec) {
//  //   res.write(rec.hash + " src/main:" + rec.main + " test/unit:" + rec.unit + " test/integration:" + rec.integration + " test/functional:" + rec.functional)
//  //   res.write("\n")
//  // })
// fs.readFile('RGraph/examples/node-line.html', 'utf-8', function (err, data) {
//    if (err) throw err;
//   res.writeHead(200, {'Content-Type': 'text/html'});
//   res.end(data);
//     });  
// }).listen(1337, "127.0.0.1");
// 
// function parseCsvFile(fileName, callback){
// 	var stream = fs.createReadStream(fileName, { encoding : 'ascii'})
// 	stream.addListener('data', function(data){
// 	  var parts = data.split('\n')
// 	  parts.forEach(function(d, i){
// 	    var line = d.split(":")
// 	    if(line.length == 5)
// 	    	callback({ hash: line[0], main: line[1], unit: line[2], integration: line[3], functional: line[4]}) 
// 	  })
// 	})
// 
// 	function buildRecord(str){
// 	  var record = {}
// 	  str.split(pattern).forEach(function(value, index){
// 	    if(header[index] != '')
// 	      record[header[index].toLowerCase()] = value.replace(/"/g, '')
// 	  })
// 	  return record
// 	}
// }
