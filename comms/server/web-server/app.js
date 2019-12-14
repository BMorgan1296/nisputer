var port = 3434,
    express = require("express"),
    path = require('path'),
    parser = require("body-parser"),
    app = express();

var long = 0.0;
var lat = 0.0;

  app.use(parser.urlencoded({extended : true}));
  app.get("/", function(req, res) 
  {
    res.sendFile(path.join(__dirname + '/index.html'));
  });

  app.get("/js/map.js", function(req, res)
  {
    res.sendFile(path.join(__dirname + '/js/map.js'));
  });

  app.get("/css/map.css", function(req, res)
  {
    res.sendFile(path.join(__dirname + '/css/map.css'));
  });

  app.get("/img/location.png", function(req, res)
  {
    res.sendFile(path.join(__dirname + '/img/location.png'));
  });

  app.get("/coords.json", function(req, res)
  {
  	res.send(JSON.stringify({ lat: -34.795690, long: 138.669570 }))
  });

//Start the server and make it listen for connections on port 8080

app.listen(port);

console.log("GPS Server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown")

module.exports = app;

//Adelaide -34.9333333 138.6
//Swansea -34.795690 138.669570