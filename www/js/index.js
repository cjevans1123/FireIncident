var map, heatmap;
var vHeatSource = '';
var vFireStation = '';
var defaultMap = 'heatmap'
var address = [];
var contentLoss = [];
var propertyValue = [];
//var URL = "https://data.greensboro-nc.gov/resource/p7u9-tyw6.json?NFIRS_IncidentType=111";

 var mapsApiLoaded = false;
var locationsArray = [];
// var googleMapsApiUrl = "https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyAx31hQ1EOEHt_SgQ5xWBusisEU-NrOxLg&callback=initialize";
var googleMapsApiUrl = "https://maps.googleapis.com/maps/api/js?v=3&key=AIzaSyAx31hQ1EOEHt_SgQ5xWBusisEU-NrOxLg&signed_in=true&libraries=visualization&callback=initMap";
var app = {
    // Application Constructor
    initiaze: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};


 //app.initialize();

// Initial map works!!
// function initMap() {
//     var mapCanvas = document.getElementById('map');
//     var mapOptions = {
//       center: new google.maps.LatLng(36.071600, -79.792189),
//       zoom: 11,
//       mapTypeId: google.maps.MapTypeId.ROADMAP
//     }
//     var map = new google.maps.Map(mapCanvas, mapOptions);
// }
// google.maps.event.addDomListener(window, 'load', initMap);

$("#selectIncidentType").change(setIncidentType);
$("#stationSelect").change(setStationArea);
$("#heatMap").click(setDefaultMap);
$("#marker").click(setDefaultMap);

function initMap() {
      map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: { lat: 36.071600, lng: -79.792189 },  //36.071600, -79.792189
        //center: { lat: 37.800738, lng:  -122.434598 },

        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        data: getPoints(),
        map: map
    });

    heatmap.set('radius', heatmap.get('radius') ? null : 30);
    var gradient = [
        'rgba(0, 255, 255, 0)',
        'rgba(0, 255, 255, 1)',
        'rgba(0, 191, 255, 1)',
        'rgba(0, 127, 255, 1)',
        'rgba(0, 63, 255, 1)',
        'rgba(0, 0, 255, 1)',
        'rgba(0, 0, 223, 1)',
        'rgba(0, 0, 191, 1)',
        'rgba(0, 0, 159, 1)',
        'rgba(0, 0, 127, 1)',
        'rgba(63, 0, 91, 1)',
        'rgba(127, 0, 63, 1)',
        'rgba(191, 0, 31, 1)',
        'rgba(255, 0, 0, 1)'
    ]

  heatmap.set('gradient', heatmap.get('gradient') ? null : gradient);
}
google.maps.event.addDomListener(window, 'load', initMap);

function toggleHeatmap() {
  heatmap.setMap(heatmap.getMap() ? null : map);
}

function setIncidentType() {
    if (this.value == "#") {
        vHeatSource = "";
    } else {
         vHeatSource = this.value;
    }
    //var url = "https://data.greensboro-nc.gov/resource/p7u9-tyw6.json?NFIRS_IncidentType=111" + this.value;
    //URL = URL + this.value;
    callDefaultMap();
}

function setStationArea() {
    vFireStation = this.value;
    //URL = URL + this.value;
   // alert(URL);
    callDefaultMap();
}


function changeRadius() {
  heatmap.set('radius', heatmap.get('radius') ? null : 10);
}

function changeOpacity() {
  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.2);
  //  heatmap.set('opacity', heatmap.get('opacity') ? null : 0.8);
}

function setDefaultMap () {
    defaultMap = this.id;
    callDefaultMap();
}

function callDefaultMap() {
    if (defaultMap == 'marker') {
        plotIncidentMarkers();
    } else {
        initMap();
    }
}

function getPoints() {

    var googlePoints = [];
    var vResponse;
    var URL = "https://data.greensboro-nc.gov/resource/p7u9-tyw6.json?NFIRS_IncidentType=111"; 

    if (vHeatSource) {
        URL = URL+ vHeatSource;
    }

    if (vFireStation) {
        URL = URL+'&station='+ vFireStation;
    }

    $.ajax({
          url: URL,
          type: "GET",
          dataType: "json",
          async: false,
      }).done (function (data) {
         vResponse = data;    
    } );

    
    for(var i = 0; i < vResponse.length; i++) {
        if(vResponse[i].fulladdress && vResponse[i].fulladdress.latitude && vResponse[i].fulladdress.longitude) {
            if( defaultMap == 'heatmap') {
                googlePoints[i] = new google.maps.LatLng(parseFloat(vResponse[i].fulladdress.latitude), parseFloat(vResponse[i].fulladdress.longitude));
            } else {
                googlePoints[i] = new google.maps.LatLng(parseFloat(vResponse[i].fulladdress.latitude), parseFloat(vResponse[i].fulladdress.longitude));
                address[i] = vResponse[i].fulladdress;
                contentLoss[i] = vResponse[i].contentloss;
                propertyValue[i] = vResponse[i].propertyvalue;
            }
        }
    }
    
    return googlePoints;
}


function plotIncidentMarkers() {
    var myLatLng = { lat: 36.071600, lng: -79.792189 };
    var vPoints = [];
    var infowindow = new google.maps.InfoWindow();
    var marker, i;
    var vAddress = '';
    var vContentLoss = 0;
    var vPropertyValue = 0;

    vPoints = getPoints();

     var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });

    var marker = new google.maps.Marker({
        position: myLatLng,
        map: map
        //icon: 'http://localhost:8100/img/marker.png'
    });     

    for (i = 0; i < vPoints.length; i++) {  
        marker = new google.maps.Marker({
             position: vPoints[i],
             map: map,
             icon: '/img/marker.png'
        });

        if (address[i] && address[i].human_address) {
            vAddress = address[i].human_address;
        } else {
            vAddress = 'No address found';
        }

        if (contentLoss[i] != 0) {
            vContentLoss = contentLoss[i];
        } else {
            vContentLoss = 'Content loss value is 0';
        }

       if (propertyValue[i] != 0) {
            vPropertyValue = propertyValue[i];
        } else {
            vPropertyValue = 'Property Value is 0';
        }

        makeInfoWindowEvent(map, infowindow, vAddress, marker);
    }
}

function makeInfoWindowEvent(map, infowindow, contentString, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(contentString);
    infowindow.open(map, marker);
  });
}