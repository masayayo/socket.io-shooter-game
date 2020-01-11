var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

console.log("kysirl");

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
io.emit('chat message', msg);
  });
});

http.listen(8181, function(){
  console.log('listening on *:8181');
});
