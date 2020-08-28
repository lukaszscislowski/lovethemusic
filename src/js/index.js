

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.get('/', function(req, res){  
  res.sendFile(__dirname + '/index.html');
});

app.use('/images', express.static(__dirname + '/images'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/css', express.static(__dirname + '/css'));

http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('user connected');
  var ob = [
        {
            "id"      : Math.random(),
            "lat"     : 52 + Math.random() + Math.random() + Math.random(),
            "lng"     : 14 + Math.random() + Math.random() + Math.random(),
            "iconUrl" : "/images/map-marker.png",
            "time"    : moment().format('YYYY/MM/DD HH:mm:ss')
        }
    ];

    io.emit('dataMapEvent', ob);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

setInterval(function() {
    var ob = [
        {
            "id"      : Math.random(),
            "lat"     : 52 + Math.random() + Math.random() + Math.random(),
            "lng"     : 14 + Math.random() + Math.random() + Math.random(),
            "iconUrl" : "/images/map-marker.png",
            "time"    : moment().format('YYYY/MM/DD HH:mm:ss')
        }
    ];

    io.emit('dataMapEvent', ob);
}, 3000);




export default function() { }