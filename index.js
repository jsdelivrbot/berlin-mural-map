var express = require('express');
var fs = require("fs");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var piexif = require('./vendor/piexif.js');
var builder = require('xmlbuilder');

var imagesDir = "public/images", thumbsDir = "public/images/thumbnails";

var coords = getCoords();

fs.writeFile('public/data/images.json', JSON.stringify(coords), function (err) {
  if (err) throw err;
});

writeKML();

function writeKML(){
var kml = builder.create('kml', { encoding: 'utf-8' })
    .att('xmlns', 'http://earth.google.com/kml/2.2');
var doc = kml.ele('Document');
doc.ele('Style', {"id": "placemark-green"})
   .ele('IconStyle')
   .ele('Icon')
   .ele('href', 'http://mapswith.me/placemarks/placemark-green.png');
doc.ele('name', 'Berlin Murals');


  coords.images.forEach(function(marker){
    var caption = marker.caption;
    if(caption.substring(0,1) === "\u0000"){
        caption = "";
    }

    var place = doc.ele("Placemark")
         .ele("name", caption).up()
         .ele("styleUrl", "#placemark-green").up()
         .ele("description", '<img src="https://berlin-mural-map.herokuapp.com/' + marker.url + '"/>').up();

    place.ele("Point")
          .ele("coordinates", marker.lon + "," + marker.lat);

    place.ele("ExtendedData")
         .ele("Data", {"name": "gx_media_links"})
         .ele("value", "https://berlin-mural-map.herokuapp.com/" + marker.url );

    kml.end();
  });


  fs.writeFile('public/data/images.kml', kml, function (err) {
    if (err) throw err;
  });
}

function writeKML(){
var kml = builder.create('kml')
    .att('xmlns', 'http://earth.google.com/kml/2.2');
var doc = kml.ele('Document');
doc.ele('Style', {"id": "placemark-green"})
   .ele('IconStyle')
   .ele('Icon')
   .ele('href', 'http://mapswith.me/placemarks/placemark-green.png');
doc.ele('name', 'Berlin Murals');

  coords.images.forEach(function(marker){
    var caption = marker.caption;
    if(caption.substring(0,1) === "\u0000"){
        caption = "";
    }

    var place = doc.ele("Placemark")
         .ele("name", caption).up()
         .ele("styleUrl", "#placemark-green").up()
         .ele("description", '<img src="https://berlin-mural-map.herokuapp.com/' + marker.url + '"/>').up();

    place.ele("Point")
          .ele("coordinates", marker.lon + "," + marker.lat);

    place.ele("ExtendedData")
         .ele("Data", {"name": "gx_media_links"})
         .ele("value", "https://berlin-mural-map.herokuapp.com/" + marker.url );

    kml.end();
  });


  fs.writeFile('public/data/images.kml', kml, function (err) {
    if (err) throw err;
  });
}

function getCoords() {
  var coords = {
    "images": []
  };

  var files = fs.readdirSync(imagesDir);
  files.forEach(function(file) {

    var path = imagesDir + '/' + file;
    var thumbPath = thumbsDir + '/' + file;

    if (fs.lstatSync(path).isDirectory() === false && file.split(".")[1].toUpperCase() === "JPG") {
      var latDec, lonDec;

      var jpeg = fs.readFileSync(path);
      var data = jpeg.toString("binary");
      var exifObj = piexif.load(data);

      //check if empty object or undefined
      if (Object.keys(exifObj.GPS).length !== 0 && exifObj.GPS.constructor === Object) {
        var latRef = exifObj.GPS[1];
        var lat = exifObj.GPS[2];
        var lonRef = exifObj.GPS[3];
        var lon = exifObj.GPS[4];

        latDec = getDMS2DD(lat[0][0], lat[1][0], lat[2][0] / lat[2][1], latRef);
        lonDec = getDMS2DD(lon[0][0], lon[1][0], lon[2][0] / lon[2][1], lonRef);
      }

      coords.images.push({
        url: "images/" + file,
        lat: latDec,
        lon: lonDec,
        caption: exifObj.Exif[piexif.ExifIFD.UserComment],
        thumb: "images/thumbnails/" + file
      });
    }

  });
  return coords;
}

function getDMS2DD(days, minutes, seconds, direction) {
     direction.toUpperCase();
     var dd = days + minutes/60 + seconds/(60*60);
     if (direction == "S" || direction == "W") {
         dd = dd*-1;
     } // Don't do anything for N or E
     return dd;
 }

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));


app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
