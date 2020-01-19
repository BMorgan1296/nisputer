var express = require("express");
var session = require('express-session');
var sanitizer = require('sanitizer');
var parser = require("body-parser");
var path = require('path');
var mysql = require('mysql');
var helmet = require('helmet');
var bcrypt = require('bcrypt');
const fs = require('fs');

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
    if (req.session.loggedin == true)
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
    if (req.session.loggedin == true)
    {
        res.redirect("/");
    }
    else
    {
        var username = sanitizer.sanitize(req.body.username);
        var password = sanitizer.sanitize(req.body.password);

        if (username && password) {
            var query = 'SELECT * FROM accounts WHERE username = ?';
            connection.query(query, [username, password], function(error, results, fields)
            {
                if(results != undefined)
                {
                    if (results.length == 1)
                    {
                        bcrypt.compare(password, results[0].password, function(err, isMatch)
                        {
                            var d = new Date();
                            var stream = fs.createWriteStream("auth_log.txt", {flags:'a'})
                            stream.write(d.toString()+" user:"+username+" loggedin:"+isMatch+" exists: true\n");
                            stream.end();

                            if(err) 
                            {
                                throw err;
                            } 
                            else if(!isMatch) 
                            {
                                res.sendFile(path.join(__dirname + '/html/loginFail.html'));
                            } 
                            else
                            {                                
                                req.session.loggedin = true;
                                req.session.username = username;
                                res.redirect('/map');
                            }
                        }) 
                    }
                    else
                    {
                        var d = new Date();
                        var stream = fs.createWriteStream("auth_log.txt", {flags:'a'})
                        stream.write(d.toString()+" user:"+username+" loggedin: false exists: false\n");
                        stream.end();
                        res.sendFile(path.join(__dirname + '/html/loginFail.html'));
                    }
                }
                else
                {
                    var d = new Date();
                    var stream = fs.createWriteStream("auth_log.txt", {flags:'a'})
                    stream.write(d.toString()+" user:"+username+" loggedin: false exists: false\n");
                    stream.end();
                    res.sendFile(path.join(__dirname + '/html/loginFail.html'));
                }
                
            });
        }
        else
        {
            res.sendFile(path.join(__dirname + '/html/loginFail.html'));
        }
    }
});

app.get("/map", function(req, res)
{
    if (req.session.loggedin == true)
    {
        res.sendFile(path.join(__dirname + '/html/map.html'));
    }
    else
    {
        res.redirect("/");
    }
});

app.post("/logout", function(req, res)
{
    if (req.session.loggedin == true)
    {
        req.session.loggedin = false;
        res.redirect("/");
    }
    else
    {
        res.redirect("/");
    }
});

app.get("/js/map.js", function(req, res)
{
    if (req.session.loggedin == true)
    {
        res.sendFile(path.join(__dirname + '/js/map.js'));
    }
    else
    {
        res.redirect("/");
    }
});

app.get("/css/map.css", function(req, res)
{
    if (req.session.loggedin == true)
    {
        res.sendFile(path.join(__dirname + '/css/map.css'));
    }
    else
    {
        res.redirect("/");
    }
});

app.get("/img/location.png", function(req, res)
{
    if (req.session.loggedin == true)
    {
        res.sendFile(path.join(__dirname + '/img/location.png'));
    }
    else
    {
        res.redirect("/");
    }
});

//Send Coordinates to client
app.get("/getCoords", function(req, res)
{
    var currTime = new Date().getTime();
    if (req.session.loggedin == true)
    {
        username = sanitizer.sanitize(req.session.username);
        var query = 'SELECT * FROM accounts WHERE username = ?';
        connection.query(query, [username], function(error, results, fields)
        {
            res.send(JSON.stringify(
            {
               lat: Number(results[0].lat),
               lon: Number(results[0].lon),
               ign: Number(results[0].ign),
               recvTime: Number(results[0].recvTime)
            }));
        });
    }
    else
    {
        res.redirect("/");
    }    
});

//Insert Coordinates
app.post("/setCoords", function(req, res)
{
    var username = sanitizer.sanitize(req.body.username);
    username = 'test';
    /*
    var lat = sanitizer.sanitize(req.body.lat);
    var lon = sanitizer.sanitize(req.body.lon);
    var ign = sanitizer.sanitize(req.body.ign);
    */
    var lat = -34.795690;
    var lon = 138.669570;
    var ign = 0;
    var recvTime = new Date().getTime();

    var query = 'UPDATE accounts SET lat = \'?\', lon = \'?\', ign = \'?\', recvTime = \'?\' WHERE username = ?';
    connection.query(query, [lat, lon, ign, recvTime, username], function(error, results, fields)
    {
        console.log(query, [lat, lon, ign, recvTime, username]);
        console.log(error);
    });
    res.end();
});

app.get("/getName", function(req, res)
{
    if (req.session.loggedin == true)
    {
        res.send(JSON.stringify(req.session.username));
    }
    else
    {
        res.redirect("/");
    }
});

//Start the server and make it listen for connections on port 8080

app.listen(port);

console.log("GPS Server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown")

module.exports = app;

//Adelaide -34.9333333 138.6
//Swansea -34.795690 138.669570