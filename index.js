var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require('redis');
var sub = redis.createClient({
  'host': '127.0.0.1',
  'port': '6379'
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

// redis subscription event
// each channel represent for a sever,
// the publisher is message queue and delivers message to specified server
sub.subscribe('server1');
sub.on('subscribe', function(channel, count){
  console.log("Subscribed to " + channel + ". Now subscribed to " + count + " channel(s).");
});
// receive message from message queue
// and deliver it to all clients
sub.on('message', function(channel, message){
  console.log("Message from channel - " + channel + ": " + message);
  io.emit('chat message', 'sever_push: ' + message);
});


// client to websocket
// verify the client cookie here, if succeed, then pass; otherwise, throw exception
io.use(function(socket, next) {
  var handshakeData = socket.request;
  console.log('configure, auth:' + handshakeData.headers.cookie);
  // make sure the handshake data looks good as before
  // if error do this: client can bind 'error' event
    // next(new Error('not authorized'));
  // else just call next
  next();
});


// specifical websocket connecting to client
io.on('connection', function(socket){
  console.log('----------------------');
  console.log(socket.id);
  socket.on('chat message', function(msg){
    io.emit('chat message', socket.id + ': ' + msg);
    // io.sockets.connected[socket.id].emit('chat message', socket.id + ': ' + msg);
    console.log('cookie:socket.io   ' + socket.request.headers.cookie);
  });

  socket.on('disconnect', function(){
    console.log('disconnect: socketID=' + socket.id);
    console.log('----------------------');
  });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});
