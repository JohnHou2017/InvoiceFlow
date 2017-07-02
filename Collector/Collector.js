var fs = require('fs');
var amqp = require('amqplib/callback_api');

var qCollectorIn = 'CollectorIn';
var qCollectorOut = 'CollectorOut';
var cCollectorIn;
var cCollectorOut;

amqp.connect('amqp://localhost', function (err, conn) {

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qCollectorIn, { durable: false });
        cCollectorIn = ch;        

        conn.createChannel(function (err, ch) {
            ch.assertQueue(qCollectorOut, { durable: false });
            cCollectorOut = ch;

            // process Gateway msg
            cCollectorIn.consume(qCollectorIn, function (msg) {

                var file = msg.content.toString();

                var inputStr = fs.readFileSync('data/' + file, 'utf8');
                
                var msgResponse = inputStr;
               
                // send to Gateway with msgResponse
                cCollectorOut.sendToQueue(qCollectorOut, new Buffer.from(msgResponse));

            }, { noAck: true });
        });
    });
       
});