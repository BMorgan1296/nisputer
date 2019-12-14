var map;
var markerLat = 0.0;
var markerLong = 0.0;
var imgSrc = "https://upload.wikimedia.org/wikipedia/commons/e/ec/RedDot.svg";

var extra = 0.01

var vectorLayer;

function updateMarkerPosition(init)
{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() 
    {
      if (this.readyState == 4 && this.status == 200) 
      {
        res = JSON.parse(this.responseText);
        markerLat = res.lat;
        markerLong = res.long;
        if(init == 1)
        {
            initialise_map();
            set_marker();
        }
        else
        {
            clear_marker();
            set_marker();            
        }
      }
    };
    xhttp.open("GET", "/coords.json", true);
    xhttp.send();
}

function initialise_map()
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
            center: ol.proj.fromLonLat([markerLong, markerLat]),
            zoom: 11
        })
    });
}

function set_marker() 
{
    vectorLayer = new ol.layer.Vector(
    {
        source:new ol.source.Vector(
        {
            features: [new ol.Feature(
            {
                geometry: new ol.geom.Point(ol.proj.transform([markerLong, markerLat], 'EPSG:4326', 'EPSG:3857')),
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

    map.addLayer(vectorLayer);
}

function clear_marker()
{
    map.removeLayer(vectorLayer);
}

window.onload = function()
{
    updateMarkerPosition(1);
};

window.setInterval(function()
{
    updateMarkerPosition(0);
}, 4000);