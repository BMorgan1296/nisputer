var map;
var recvTime = 0;
var imgSrc = "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg";

var extra = 0.01

var vectorLayer;

function secondsToTime(msecs)
{
    var secs = msecs/1000
    secs = Math.round(secs);
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

function updateMarkerPosition(init)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        res = JSON.parse(this.responseText);
        recvTime = res.recvTime;

        if(init == 1)
        {
            initialise_map(res.lat, res.lon);
            set_marker(res.lat, res.lon);
        }
        else
        {
            clear_marker();
            set_marker();
        }
        document.getElementById("spd").innerHTML = "Speed: "+res.spd+"km/h";
        document.getElementById("hdg").innerHTML = "Heading: "+res.hdg+"&deg;";
        if(res.ign)
            document.getElementById("ign").innerHTML = "Car Ignition: ON";
        else
            document.getElementById("ign").innerHTML = "Car Ignition: OFF";

        document.getElementById("link").href = "http://maps.google.com/maps?q="+res.lat+","+res.lon;
      }
    };
    xhttp.open("GET", "/getCoords", true);
    xhttp.send();
}

function initialise_map(lat, lon)
{
    map = new ol.Map(
    {
        target: "map",
        layers: [
            new ol.layer.Tile(
            {
                source: new ol.source.OSM(
                {
                    url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                })
            })
        ],
        view: new ol.View(
        {
            center: ol.proj.fromLonLat([lat, lon]),
            zoom: 11
        })
    });
}

function set_marker(lat, lon)
{
    vectorLayer = new ol.layer.Vector(
    {
        source:new ol.source.Vector(
        {
            features: [new ol.Feature(
            {
                geometry: new ol.geom.Point(ol.proj.transform([lat, lon], 'EPSG:4326', 'EPSG:3857')),
            })]
        }),
        style: new ol.style.Style(
        {
            image: new ol.style.Icon(
            {
                anchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                src: imgSrc
            })
        })
    });
    extra = extra + 0.01;
    map.addLayer(vectorLayer);
}

function changeRecvTime()
{
    var d = new Date().getTime();
    var update = secondsToTime((d - recvTime));
    var timeString = 'Time since last GPS update: '+update.h+':'+update.m+':'+update.s;
    document.getElementById("recvTime").innerHTML = timeString;
}

function clear_marker()
{
    map.removeLayer(vectorLayer);
}

function getName()
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        res = JSON.parse(this.responseText);
        document.getElementById("name").innerHTML = "Logged in as: "+res;
      }
    };
    xhttp.open("GET", "/getName", true);
    xhttp.send();
}

window.onload = function()
{
    getName();
    updateMarkerPosition(1);
};

window.setInterval(function()
{
    updateMarkerPosition(0);
}, 2000);

window.setInterval(function()
{
    changeRecvTime();
}, 500);
