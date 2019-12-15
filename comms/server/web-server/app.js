var express = require("express");
var session = require('express-session');
var sanitizer = require('sanitizer');
var parser = require("body-parser");
var path = require('path');
var mysql = require('mysql');
var helmet = require('helmet');

var app = express();

//Create MYSQL connection
var connection = mysql.createConnection(
{
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'nisputer'
});

//Init Cookie and other packages
app.use(session(
{
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
app.use(parser.urlencoded({extended : true}));
app.use(parser.json());

var port = 3434;
var long = 0.0;
var lat = 0.0;
var gpsRecvTime = new Date().getTime();

//Login expiry
var expiryDate = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

app.use(helmet());
app.set('trust proxy', 1); // trust first proxy


app.use(parser.urlencoded(
{
    extended: true
}));
app.get("/", function(req, res)
{
    if (req.session.loggedin)
    {
        res.sendFile(path.join(__dirname + '/html/map.html'));
    }
    else
    {        
        res.sendFile(path.join(__dirname + '/html/login.html'));
    }
});

app.post('/auth', function(req, res)
{
    var username = sanitizer.sanitize(req.body.username);
    var password = sanitizer.sanitize(req.body.password);

    if (username && password) {
        var query = 'SELECT * FROM accounts WHERE username = ? AND password = ?';
        connection.query(query, [username, password], function(error, results, fields)
        {
            if (results.length == 1)
            {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/map');
            }
            else
            {
                res.sendFile(path.join(__dirname + '/html/loginFail.html'));
            }
        });
    }
    else
    {
        res.send('Please enter Username and Password!');
        res.end();
    }
});

app.get("/map", function(req, res)
{
    if (req.session.loggedin)
    {
        res.sendFile(path.join(__dirname + '/html/map.html'));
    }
    else
    {
        res.send('Please login to view this page!');
        res.end();
    }
});

app.post("/logout", function(req, res)
{
    req.session.loggedin = false;
    res.redirect("/");
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