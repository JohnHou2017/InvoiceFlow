var http = require('http');
var amqp = require('amqplib/callback_api');

// queue names
var qCollectorIn = 'CollectorIn';
var qCollectorOut = 'CollectorOut';
var qParserIn = 'ParserIn';
var qParserOut = 'ParserOut';
var qPersisterIn = 'PersisterIn';
var qPersisterOut = 'PersisterOut';
var qReporterIn = 'ReporterIn';
var qReporterOut = 'ReporterOut';

// channels of above queues
var cCollectorIn;
var cCollectorOut;
var cParserIn;
var cParserOut;
var cPersisterIn;
var cPersisterOut;
var cReporterIn;
var cReporterOut;

// create message channels
amqp.connect('amqp://localhost', function (err, conn) {

    conn.createChannel(function (err, ch) {        
        ch.assertQueue(qCollectorIn, { durable: false });
        cCollectorIn = ch;
    });    
    conn.createChannel(function (err, ch) {
        ch.assertQueue(qCollectorOut, { durable: false });
        cCollectorOut = ch;        
    });    

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qParserIn, { durable: false });
        cParserIn = ch;
    });
    conn.createChannel(function (err, ch) {
        ch.assertQueue(qParserOut, { durable: false });
        cParserOut = ch;
    });    

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qPersisterIn, { durable: false });
        cPersisterIn = ch;
    });
    conn.createChannel(function (err, ch) {
        ch.assertQueue(qPersisterOut, { durable: false });
        cPersisterOut = ch;
    });    

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qReporterIn, { durable: false });
        cReporterIn = ch;
    });
    conn.createChannel(function (err, ch) {
        ch.assertQueue(qReporterOut, { durable: false });
        cReporterOut = ch;
    });    

});


var port = process.env.port || 1337;

http.createServer(function (req, res) {
    
    var inputfile = 'input.json';

    // send to Collector with msg
    cCollectorIn.sendToQueue(qCollectorIn, new Buffer.from(inputfile));

    // process Collector response msg
    cCollectorOut.consume(qCollectorOut, function (msg) {
        
        var msgResponse = msg.content.toString();

        // send to Parser with msgResponse
        cParserIn.sendToQueue(qParserIn, new Buffer.from(msgResponse));
        
    }, { noAck: true });

    // process Parser response msg
    cParserOut.consume(qParserOut, function (msg) {

        var msgResponse = msg.content.toString();
       
        // send to Persister with msgResponse
        cPersisterIn.sendToQueue(qPersisterIn, new Buffer.from(msgResponse));

    }, { noAck: true });

    // process Persister response msg
    cPersisterOut.consume(qPersisterOut, function (msg) {

        var msgResponse = msg.content.toString();

        if (msgResponse == 'Inserting') {

            var command = 'GenerateReportFromDatabase';
            
            var waitInsertDone = 5000;
            
            setTimeout(function () {                    
                    // send to Reporter to select latest records with msgResponse
                    // delay this query to ensure getting latest records until inserting done
                    cReporterIn.sendToQueue(qReporterIn, new Buffer.from(command));
                },
                waitInsertDone);            
        }

    }, { noAck: true });

    // process Reporter response msg
    cReporterOut.consume(qReporterOut, function (msg) {

        var report = msg.content.toString();

        //console.log(report);

        // format json string with adding carrage returns before "original" and "responses"
        var content = report.replace(/{\"original\":/g, "</br></br>{\"original\":</br>").replace(/\"responses\":/g, "</br>\"responses\":</br>");
               
        // send report to client Browser       
        res.writeHead(200, { "Content-Type": "text/html" });           
        res.end(content);
        
        
    }, { noAck: true });

}).listen(port);