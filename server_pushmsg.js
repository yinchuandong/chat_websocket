var redis = require('redis');
var rclient = redis.createClient({
  'host': '127.0.0.1',
  'port': '6379'
});

// var callback = function(err, reply){
//     console.log(reply);
// };
// rclient.rpush('message', ['message_123'], callback);


var multi = rclient.multi()
for (var i=0; i<100; i++) {
  multi.rpush('message', 'message_' + i);
}
multi.exec(function(err, reply) {
  // console.log(reply);
})