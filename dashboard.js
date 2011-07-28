var http = require('http');
var fs = require('fs');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  parseCsvFile('/private/tmp/foo.txt', function(rec) {
    res.write(rec)
  })
//fs.readFile('/private/tmp/foo.txt', 'ascii', function (err, data) {
//   if (err) throw err;
//  res.writeHead(200, {'Content-Type': 'text/plain'});
//  res.end(data);
//    });  
}).listen(1337, "127.0.0.1");

function parseCsvFile(fileName, callback){
	var stream = fs.createReadStream(fileName, { encoding : 'ascii'})
	stream.addListener('data', function(data){
	  var parts = data.split('\r\n')
	  parts.forEach(function(d, i){
	    callback(d)
	    console.log(d)
	  })
	})

	function buildRecord(str){
	  var record = {}
	  str.split(pattern).forEach(function(value, index){
	    if(header[index] != '')
	      record[header[index].toLowerCase()] = value.replace(/"/g, '')
	  })
	  return record
	}
}
