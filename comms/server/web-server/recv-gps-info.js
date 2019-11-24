var host = '127.0.0.1';
var port = 3535;

var dgram = require('dgram');
var server = dgram.createSocket('udp4');

server.on('listening', function() {
  var address = server.address();
 console.log('UDP GPS Server listening on ' + address.address + ':' + address.port);
});

server.on('message', function(message, remote) {
 console.log(remote.address + ':' + remote.port +' - ' + message);
});

server.bind(3535, HOST);