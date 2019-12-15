var port = 3434,
    express = require("express"),
    path = require('path'),
    parser = require("body-parser"),
    app = express(),
    helmet = require('helmet'),
    session = require('cookie-session');

var long = 0.0;
var lat = 0.0;
var gpsRecvTime = new Date().getTime();

app.use(helmet());
app.set('trust proxy', 1); // trust first proxy

var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
app.use(session(
{
    name: 'session',
    keys: ['key1', 'key2'],
    cookie:
    {
        secure: true,
        httpOnly: true,
        domain: 'example.com',
        path: 'foo/bar',
        expires: expiryDate
    }
}))

app.use(parser.urlencoded(
{
    extended: true
}));
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
    res.send(JSON.stringify(
    {
        lat: -34.795690,
        long: 138.669570,
        date: gpsRecvTime
    }))
});

app.post("coords.json", function(req, res)
{
    long = req.body.long;
    lat = req.body.lat;
    gpsRecvTime = Date.getTime()
});

//Start the server and make it listen for connections on port 8080

app.listen(port);

console.log("GPS Server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown")

module.exports = app;

//Adelaide -34.9333333 138.6
//Swansea -34.795690 138.669570