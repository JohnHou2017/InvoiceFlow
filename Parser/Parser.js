var amqp = require('amqplib/callback_api');

var qParserIn = 'ParserIn';
var qParserOut = 'ParserOut';
var cParserIn;
var cParserOut;

amqp.connect('amqp://localhost', function (err, conn) {
   
    conn.createChannel(function (err, ch) {
        ch.assertQueue(qParserIn, { durable: false });
        cParserIn = ch;

        conn.createChannel(function (err, ch) {
            ch.assertQueue(qParserOut, { durable: false });
            cParserOut = ch;

            // process Gateway msg
            cParserIn.consume(qParserIn, function (msg) {
               
                var inputObj = JSON.parse(msg.content.toString());
                
                var data = [];

                for (var i in inputObj) {                                      

                    var item = inputObj[i];

                    var obj = {};
                    if (item.hasOwnProperty('status')) {
                        obj.documentType = 'Response';
                        obj.status = item.status;
                        obj.documentNumber = item.responseNumber;
                        obj.originalDocumentNumber = item.originalInvoiceNumber;
                    }
                    else {                        
                        obj.documentType = 'Invoice';                        
                        obj.documentNumber = item.invoiceNumber;
                    }
                    
                    obj.date = new Date(item.date).getTime();
                    obj.amount = parseFloat(item.amount);
                    obj.currency = item.currency;

                    data.push(obj);
                        
                }

                var msgResponse = JSON.stringify(data);
                
                // send to Gateway with msgResponse
                cParserOut.sendToQueue(qParserOut, new Buffer.from(msgResponse));

            }, { noAck: true });
        });
    });

});