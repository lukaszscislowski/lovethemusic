export default function() { }

(function() {
    var map = null; //mapa google
    var markers = [];
    var mapTooltip = null;
    var mapLines = [];
    var centerMap = false;
    var mapInterval = 1000 * 3;
    var newMarkersData = [];


    
    function clearMarkers() {
        markers.forEach(function(el, i) {
            el.setMap(null);
        });
        markers = [];
    }

    function clearLines() {
        mapLines.forEach(function(el, i) {
            el.setMap(null);
        });
        mapLines = [];
    }

    function centerCanvas() {
        //powiekszamy obszar tak by obejmowal markery
        var bounds = new google.maps.LatLngBounds();
        markers.forEach(function(el, i) {
            var latlng = new google.maps.LatLng(el.getPosition().lat(), el.getPosition().lng());
            bounds.extend( latlng );
        });

        if (markers.length > 1) {
            map.fitBounds( bounds );
        }
        map.setCenter( bounds.getCenter() );
    }

    function drawLineBetweenNewMarkers(markersData) {
        var linesCoordinates = [];

        //bede rysowal linie miedzy ostatnim markerem a pierwszym z nowo wczytanych
        if (markers.length) {
            linesCoordinates.push({
                lat : markers[markers.length-1].getPosition().lat(),
                lng : markers[markers.length-1].getPosition().lng()
            })
        }

        //nowo wczytane...
        markersData.forEach(function(el, i) {
            linesCoordinates.push({
                lat : el.lat,
                lng : el.lng
            });
        });

        var line = new google.maps.Polyline({
            path: linesCoordinates, //przekazuję powyżej zebrane markery
            geodesic: true,
            strokeColor: '#DB3737',
            strokeOpacity: 0.7,
            strokeWeight: 2
        });

        line.setMap(map);

        mapLines.push(line);
    }

    function createNewMarkers(markersData) {
        markersData.forEach(function(el, i) {
            var newMarker = createSingleMarker(el);
            markers.push(newMarker);
        });
    }

    function createSingleMarker(ob) {
        //okreslenie grafiki markera
        var image = {
            url: ob.iconUrl,
            size: new google.maps.Size(39, 36), //rozmiar ikony
            origin: new google.maps.Point(0, 0), //pozycja na spricie
            anchor: new google.maps.Point(20, 31), //x,y miejsca w ktore wskazuje ikona - grot ikony
            labelOrigin: new google.maps.Point(19, 15) //pozycja teksty labelki
        };

        //ksztalt klikalnej powierzchni markera
        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };

        //każdy marker będzie miał numer porządkowy. Poniżej go tworzymy
        var label = new MarkerWithLabel({
            color : '#fff',
            fontFamily : 'sans-serif',
            fontSize : '12px',
            fontWeight : 'bold',
            text : '' + ob.text
        });

        //tworzymy marker z powyższymi danymi
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ob.lat, ob.lng),
            icon: image,
            map: map,
            shape: shape,
            label: label,
            labelOrigin: new google.maps.Point(26.5, 20),
            zIndex: 1
        });
        marker.txt = 'Godzina:<br />' + ob.time + '<br />' + ob.lat + '-' + ob.lng;

        //tworzymy pokazywanie dymka po kliknięciu na marker
        google.maps.event.addListener(marker, "click", function() {
            mapTooltip.setPosition(marker.getPosition());
            mapTooltip.setContent(marker.txt);
            mapTooltip.open(map);
        });

        return marker;
    }


    function createMap() {
        var mapOptions = {
            zoom: 10,
            zoomControl: true,
            streetViewControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: new google.maps.LatLng(52.229676, 21.012229),
            disableDefaultUI: true
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        mapTooltip = new google.maps.InfoWindow();
    }

    function loadNewMarkers() {
        var deffer = jQuery.Deferred();
        var newMarkersData = [];

        $.ajax({
            type: "GET",
            url: 'generate_coords.php',
            dataType: "json",
            cache: false,
            success: function (json) {
                json.data.forEach(function(el, i) {
                    if (!markers.length || (markers.length && (markers[markers.length-1].getPosition().lat() !== el.lat || markers[markers.length-1].getPosition().lng() !== el.lng))) {
                        newMarkersData.push({
                            'lat' : el.lat,
                            'lng' : el.lng,
                            'iconUrl' : el.iconUrl,
                            'time' : el.time,
                            'text' : markers.length + i + 1
                        });
                    }
                });

                deffer.resolve(newMarkersData);
            },
            error: function() {
                deffer.reject();
            }
        });

        return deffer.promise();
    }

    function createNewMarkers(markersData) {
        markersData.forEach(function(el, i) {
            var newMarker = createSingleMarker(el);
            markers.push(newMarker);
        });
    }

    function mainLoop() {
        $.when(loadNewMarkers()).then(function(newMarkers) {
            drawLineBetweenNewMarkers(newMarkersData);
            createNewMarkers(newMarkersData);

            if (markers.length && !centerMap) {
                centerCanvas();
                if (markers.length >=2) {
                    centerMap = true;
                }
            }
            setTimeout(function() {
                mainLoop();
            }, mapInterval)
        }, function(error) {
            console.warn('Błąd wczytania danych');
        });
    }
    $(function() {
        createMap();
        mainLoop();
    });

    $('.clear-map').on('click', function(el) {
        clearLines();
        clearMarkers();
        centerMap = false;
    });
})();