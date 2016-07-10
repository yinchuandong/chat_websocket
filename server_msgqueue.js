var redis = require('redis');
var rclient = redis.createClient({
  'host': '127.0.0.1',
  'port': '6379'
});
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

console.log('=========end==========');