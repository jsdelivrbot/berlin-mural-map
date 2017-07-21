var map, geotaggedPoint, geotagPhotoCrosshair, photos = [];
var gpsOutput = document.getElementById('output');

var osmLayer = createOsmLayer(),
 stamenLayer = createStamenLayer(),
 mapboxLiteLayer = createMapBoxLayer();
 photoLayer = createPhotoLayer();

var baseLayers = {
   "mapbox lite": mapboxLiteLayer,
   "osm": osmLayer,
   "stamen toner": stamenLayer
};

init();

function init(){
  $("#edit").hide();
  $("#selection").hide();

  map = L.map('map');
  addControlLayer();

  map.setView([52.501255, 13.442426], 12);
  map.addLayer(mapboxLiteLayer);
  parseData();
  addPhotoLayer();
}

function createOsmLayer(){
  return L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: 'Openstreet Maps',
  });
}

function createMapBoxLayer(){
   return L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoicm9iam9lb2wiLCJhIjoiY2lwcWRqYzBpMDA0ZGh6bmI1ZXl1bHlnNiJ9.XtCd6zNZvybnd2eICtZm0w', {
      	attribution: 'Imagery from <a href="http://mapbox.com/about/maps/">MapBox</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'});
}

function createStamenLayer(){
  return L.tileLayer('http://a.tile.stamen.com/toner/{z}/{x}/{y}.png');
}

function addControlLayer(){
  L.control.layers(baseLayers).addTo(map);
}

function createPhotoLayer(){
  return L.photo.cluster().on('click', function (evt) {
  		var photo = evt.layer.photo,
  			template = '<img src="{url}"/></a><p>{caption}</p>';
  		if (photo.video && (!!document.createElement('video').canPlayType('video/mp4; codecs=avc1.42E01E,mp4a.40.2'))) {
  			template = '<video autoplay controls poster="{url}"><source src="{video}" type="video/mp4"/></video>';
  		};
  		evt.layer.bindPopup(L.Util.template(template, photo), {
  			className: 'leaflet-popup-photo',
  			minWidth: 400
  		}).openPopup();
  	});
}

function addPhotoLayer(){
  // console.log(photos);
  // photoLayer.add(photos).addTo(map);
  // map.fitBounds(photoLayer.getBounds());
}

function addGalleryItem(image){
  var link =  "<a href='" + image.url + "' data-lightbox='street'></a>"
  var imgThumb = "<img src='" + image.thumb + "' />";

   $("#gallery").append(imgThumb);
   $("#gallery img:last").wrap(function(){
     return link;
   });
}


function parseData(){
    var jqxhr  = $.getJSON("data/images.json",function(data){
        data.images.forEach(function(image){
          addGalleryItem(image);

          if(image.lat !== undefined){
             photos.push({
    						lat: image.lat,
    						lng: image.lon,
    						url: image.url,
    						caption: image.caption,
    						thumbnail: image.thumb
    					});
          }

        });
         photoLayer.add(photos).addTo(map);
         map.fitBounds(photoLayer.getBounds());
      });
}

  function toggleGeotag(){
    if(geotagPhotoCrosshair === undefined){
      geotagPhotoCrosshair = L.geotagPhoto.crosshair({crosshairHTML: "<img src='images/crosshair.svg' width='100px' />"}).addTo(map)
            .on('input', function (event) {
                updateSample();
          })
    }else{
        geotagPhotoCrosshair.removeFrom(map);
        geotagPhotoCrosshair = undefined;
        gpsOutput.innerHTML = "";
    }
  }

  function addSelection(){
      $("#gallery a img").each(function(i){
        $("select.image-picker").append("<option>");
         $("select.image-picker option:last").attr({
           "data-img-src": $(this).attr("src"),
           "value" : i
         });
      });

      $(".image-picker").imagepicker();
  }

  function updateSample() {
        geotaggedPoint = geotagPhotoCrosshair.getCrosshairPoint()
        gpsOutput.innerHTML = JSON.stringify(geotaggedPoint, null, 2)
  }

  function edit(){
    var gallery = $("#gallery"),
    select = $("#selection");

    if(gallery.is(':visible')){
      $("#editButton").html("Finish Edit");

      //populate selection  and show
      if($("#selection select").children().length === 0){
        addSelection();
      }
    }
    else{
      $("#editButton").html("Edit Photo");
    }

    $("#edit").toggle();
    gallery.toggle();
    select.toggle();
  }

  function save(){
    if(geotagPhotoCrosshair !== undefined && geotaggedPoint !== undefined){
      var photoPath = ($(".image-picker option:selected").attr("data-img-src")).replace("thumbnails/", "");
      var thumbPath = ($(".image-picker option:selected").attr("data-img-src"));
      var caption = $("input[name='caption']").val();

      console.log(caption);

      var lat = geotaggedPoint.coordinates[1];
      var lon = geotaggedPoint.coordinates[0];

      //TODO: update on server
      console.log("update", photoPath, lat, lon);

      var update = {
        lat: lat,
        lon: lon,
        url: photoPath,
        caption: caption,
        thumb: thumbPath
      };

      // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: update,
            url: '/update',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {
                  //do something
            }
            else {
                alert('Error: ' + response.msg);
            }
        });


      var found = updatePhoto(photoPath, lat, lon);

      if (!found){
           photos.push({
             lat: lat,
             lng: lon,
             url: photoPath,
             caption: "caption",
             thumbnail: thumbPath
           });
         }

       map.removeLayer(photoLayer);
       photoLayer = createPhotoLayer();
       photoLayer.add(photos).addTo(map);
       map.fitBounds(photoLayer.getBounds());
    }
  }

  function updatePhoto(photoPath, lat, lon){
    var found = false;
    for(var i=0; el=photos[i]; i++) {
      if (el.url === photoPath) {
          el.lat = lat;
          el.lng = lon;
          found = true;
          break;
      }
  }
  return found;
}
