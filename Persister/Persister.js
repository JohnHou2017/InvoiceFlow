var amqp = require('amqplib/callback_api');
var Client = require('mariasql');
var assert = require('assert');

var qPersisterIn = 'PersisterIn';
var qPersisterOut = 'PersisterOut';
var cPersisterIn;
var cPersisterOut;

var dbconn = new Client({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
    db: "invoice"
});

amqp.connect('amqp://localhost', function (err, conn) {

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qPersisterIn, { durable: false });
        cPersisterIn = ch;

        conn.createChannel(function (err, ch) {
            ch.assertQueue(qPersisterOut, { durable: false });
            cPersisterOut = ch;

            // process Gateway msg
            cPersisterIn.consume(qPersisterIn, function (msg) {

                //console.log(msg.content.toString());

                var inputObj = JSON.parse(msg.content.toString());
           
                for (var i in inputObj) {

                    var item = inputObj[i];
                 
                    var stat = "";

                    if (item.documentType == 'Response') {                       
                        stat = "INSERT INTO response (documentNumber, originalDocumentNumber, status, date, amount, currency) VALUES (" +
                            "'" + item.documentNumber + "'," +
                            "'" + item.originalDocumentNumber + "'," +
                            "'" + item.status + "'," +
                            item.date + "," +
                            item.amount + "," +
                            "'" + item.currency + "')";
                    }
                    else if (item.documentType == 'Invoice') {                       
                        stat = "INSERT INTO invoice (documentNumber, date, amount, currency) VALUES (" +
                            "'" + item.documentNumber + "'," +
                            item.date + "," +
                            item.amount + "," +
                            "'" + item.currency + "')";
                    }                                 

                    //console.log(stat);

                    // MariaDB non-block async insert
                    dbconn.query(stat, function (err) {
                        //assert.strictEqual(err, null);

                        dbconn.end();
                    });

                }                

                var msgResponse = "Inserting";
                
                // send to Gateway with msgResponse
                cPersisterOut.sendToQueue(qPersisterOut, new Buffer.from(msgResponse));

            }, { noAck: true });
        });
    });

});