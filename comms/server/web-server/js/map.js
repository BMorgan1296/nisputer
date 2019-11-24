//https://stackoverflow.com/questions/28517050/how-to-constantly-update-data-to-a-page-using-node-js-and-express
//////////////////////////////

var vectorLayer = new ol.layer.Vector({ // VectorLayer({
  source: new ol.source.Vector(),
});
var map = new ol.Map({
  layers: [
    new ol.layer.Tile({ // TileLayer({
      source: new ol.source.OSM()
    }),
    vectorLayer,
  ],
  target: 'map',
  view: new ol.View({
    center: [0, 0],
    zoom: 2
  })
});
console.log(map.getInteractions());
var dblClickInteraction;
// find DoubleClickZoom interaction
map.getInteractions().getArray().forEach(function(interaction) {
  if (interaction instanceof ol.interaction.DoubleClickZoom) {
    dblClickInteraction = interaction;
  }
});
// remove from map
map.removeInteraction(dblClickInteraction)
var vectorSource = vectorLayer.getSource();

function addMarker(coordinates) 
{
    try
    {
        vectorSource.removeFeature(vectorSource.getFeatures()[0])
    }
    catch
    {
        //All Good
    }
    console.log(coordinates);
    var marker = new ol.Feature(new ol.geom.Point(coordinates));
    var zIndex = 1;
    marker.setStyle(new ol.style.Style(
    {
        image: new ol.style.Icon((
        {
            anchor: [0.5, 160],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            opacity: 1,
            src: "img/location.png",
            scale: 0.19,
            zIndex: zIndex
        })),
        zIndex: zIndex
    }));
    vectorSource.addFeature(marker);
}
map.on('dblclick', function(evt) {
  console.log(ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'));
  addMarker(evt.coordinate);
});/*
var south = 24.0;
var west = -125.8;
var north = 49.6;
var east = -66.4;
// [maxx, maxy, minx, miny]
var extent = ol.proj.transformExtent([east, north, west, south], 'EPSG:4326', 'EPSG:3857');
map.getView().fit(extent, {
  size: map.getSize(),
  padding: [5, 5, 5, 5]
});*/