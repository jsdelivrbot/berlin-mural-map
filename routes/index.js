var http = require('http');
var express = require('express');
var router = express.Router(),
    fs = require("fs"),
    piexif = require("../vendor/piexif.js");


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/update', function(req, res, next) {
  var photoPath = './public/' + req.body.url;
  var lat = req.body.lat, lon = req.body.lon, caption = req.body.caption;

  var jpeg = fs.readFileSync(photoPath);
  var data = jpeg.toString("binary");
  var exifObj = piexif.load(data);

  var zeroth = exifObj["0th"], exif = exifObj.Exif, gps = exifObj.GPS;
  inter = exifObj.Interop, first = exifObj["1st"], thumbnail = exifObj.thumbnail;

console.log(req.body);

      gps[piexif.GPSIFD.GPSLatitudeRef] = lat < 0 ? 'S' : 'N';
      gps[piexif.GPSIFD.GPSLatitude] = piexif.GPSHelper.degToDmsRational(lat);
      gps[piexif.GPSIFD.GPSLongitudeRef] = lon < 0 ? 'W' : 'E';
      gps[piexif.GPSIFD.GPSLongitude] = piexif.GPSHelper.degToDmsRational(lon);

    exif[piexif.ExifIFD.UserComment] = caption;

  var exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps, "Interop" : inter, "1st": first, "thumbnail" : thumbnail};
  var exifbytes = piexif.dump(exifObj);

  var newData = piexif.insert(exifbytes, data);
  var newJpeg = new Buffer(newData, "binary");
  fs.writeFileSync(photoPath, newJpeg);

  res.send("");
});

function update(url, lat, lon){
  console.log(__dirname + "/public/" + url);

  }

module.exports = router;
