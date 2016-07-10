# real-time chat based on websocket and redis message queue

* [**How To Use**](https://github.com/yinchuandong/chat_websocket#How-To-Use)
* [**About index.js**](https://github.com/yinchuandong/chat_websocket#About-indexjs)
* [**About Message Queue**](https://github.com/yinchuandong/chat_websocket#About-Message-Queue)

![chat server](https://github.com/yinchuandong/chat_websocket/blob/master/screenshot/chat_server.png)

### How To Use
   1. npm install --save
   2. supervisor index.js ***create a push server, it also can be a cluster if it is run on different machine***
   3. open http://127.0.0.1:3000 in your brower in multiple tabs.
   4. supervisor server_msgqueue.js ***As a consumer who creates a message queue based on redis. You can create multiple consumers***
   5. supervisor server_pushmsg.js  ***As a producer who pushes multiple message***


### About index.js
   index.js is running on a push server, to which all clients are connecting,

##### 1. subscript the channel of redis because redis is used to communicate between message queue and sever
```javascript
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
```

##### 2. verify the cookie that client sends to sever, you may need a redis to store all user login information. If verification is failed, you can bind an 'error' event on client to accept the error message.
```javascript
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
```

##### 3. if cookie is verified, then sever can build websocket connection with client
```javascript
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
```

### About Message Queue
##### get messages and dispatch them to specific server. It can be distributed because each channel represent for a server. Alternatively, you can use socket to interact if you like in case of the scalability of distributed redis.
```javascript
var publiser = redis.createClient();

var callfunc = function(err, reply){
    console.log('reply is:');
    console.log(reply);
    // deliver message to specific user server
    publiser.publish('server1', reply[1], function(err1, reply1){
        // console.log('=========error==========');
        // console.log('=========error==========');
    });

    rclient.blpop('message', 0, callfunc);
}
rclient.blpop('message', 0, callfunc);
```

   
