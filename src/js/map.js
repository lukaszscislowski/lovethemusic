export default function() { }

(function() {
    var socket = io(); //biblioteka socket
    var mapInterval = 1000 * 3; //sprawdzamy co 3 sekundy
    var map = null; 	// obiekt globalny
    var mapTooltip = null; 	//okno z informacjami
    var newMarkersData = []; //nowo wczytywane markery
    var markers = []; //markery na mapie
    var mapLines = []; //linie na mapie

    function createMap() {
        var mapOptions = {
            zoom: 10,
            zoomControl: true,
            streetViewControl: true,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: new google.maps.LatLng(52.24755, 21.02418),
            disableDefaultUI: true
        };
        map = new google.maps.Map(document.getElementById("map"), mapOptions);
        mapTooltip = new google.maps.InfoWindow();
    }

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

    function createNewMarkers(data) {
        data.forEach(function(el, i) {
            var newMarker = createSingleMarker({
                'lat' : el.lat,
                'lng' : el.lng,
                'iconUrl' : el.iconUrl,
                'time' : el.time,
                'text' : markers.length + i + 1
            });
            markers.push(newMarker);
        });
    }

    function createSingleMarker(ob) {
        var image = {
            url: ob.iconUrl,
            size: new google.maps.Size(39, 36), //rozmiar ikony
            origin: new google.maps.Point(0, 0), //pozycja na spricie
            anchor: new google.maps.Point(20, 31), //x,y miejsca w ktore wskazuje ikona - grot ikony
            labelOrigin: new google.maps.Point(19, 15) //pozycja teksty labelki
        };

        var shape = {
            coords: [1, 1, 1, 20, 18, 20, 18, 1],
            type: 'poly'
        };

        var label = new MarkerWithLabel({
            color : '#fff',
            fontFamily : 'sans-serif',
            fontSize : '12px',
            fontWeight : 'bold',
            text : '' + ob.text
        });

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ob.lat, ob.lng),
            icon: image,
            map: map,
            shape: shape,
            label: label,
            labelOrigin: new google.maps.Point(26.5, 20),
            zIndex: 10000 - (ob.lat * 1000) //moze tutaj jest inna metoda?
        });
        marker.txt = '<strong>Godzina:</strong><br />' + ob.time + '<br />' + ob.lat + '-' + ob.lng;

        google.maps.event.addListener(marker, "click", function() {
            mapTooltip.setPosition(marker.getPosition());
            mapTooltip.setContent(marker.txt);
            mapTooltip.open(map);
        });

        return marker;
    }

    function drawLineBetweenNewMarkers(data) {
        var linesCoordinates = [];

        //bede rysowal linie miedzy ostatnim markerem a nowymi
        if (markers.length) {
            linesCoordinates.push({
                lat : markers[markers.length-1].getPosition().lat(),
                lng : markers[markers.length-1].getPosition().lng()
            })
        }

        //oraz miedzy nowymi
        data.forEach(function(el, i) {
            linesCoordinates.push({
                lat : Number(el.lat),
                lng : Number(el.lng)
            });
        });

        var line = new google.maps.Polyline({
            path: linesCoordinates,
            geodesic: true,
            strokeColor: '#DB3737',
            strokeOpacity: 0.8,
            strokeWeight: 2
        });

        line.setMap(map);
        mapLines.push(line);
    }


    $(function() {
        createMap();

        var centerMap = false;
        socket.on('dataMapEvent', function(res){
            drawLineBetweenNewMarkers(res);
            createNewMarkers(res);            
            
            //centrujemy przy 1, potem juz nie centrujemy
            //poniewaz powodowalo by to, ze uzytkownik nie mogl by przesuwac mapy
            if (markers.length && !centerMap) {
                centerCanvas();    
                if (markers.length >=2) {
                    centerMap = true;            
                }
            }            
        });            

        $('.clear-map').on('click', function(el) {
            clearLines();
            clearMarkers();
            centerMap = false;
        });
    })
})();