var amqp = require('amqplib/callback_api');
var Client = require('mariasql');

var qReporterIn = 'ReporterIn';
var qReporterOut = 'ReporterOut';
var cReporterIn;
var cReporterOut;

var dbconn = new Client({
    host: '127.0.0.1',
    user: 'root',
    password: 'root123',
    db: "invoice"
});

amqp.connect('amqp://localhost', function (err, conn) {

    conn.createChannel(function (err, ch) {
        ch.assertQueue(qReporterIn, { durable: false });
        cReporterIn = ch;

        conn.createChannel(function (err, ch) {
            ch.assertQueue(qReporterOut, { durable: false });
            cReporterOut = ch;

            // process Gateway msg
            cReporterIn.consume(qReporterIn, function (msg) {

                var command = msg.content.toString();
                
                if (command == 'GenerateReportFromDatabase') {
                                       
                    var stat = ' select ' +
                        ' invoice.documentNumber as invoiceNumber, invoice.date as invoiceDate, invoice.amount as invoiceAmount, invoice.currency as invoiceCurrency, ' +
                        ' response.documentNumber as responseNumber, response.`status` as responseStatus, response.date as responseDate, response.amount as responseAmount, response.currency as responseCurrency ' +
                        ' from invoice ' +
                        ' join response on response.originalDocumentNumber = invoice.documentNumber ' +
                        ' order by invoice.documentNumber * 1 asc , response.date desc ';
                    
                    dbconn.query(stat, function (err, rows) {
                        
                        if (err)
                            throw err;

                        //console.dir(rows);

                        //console.log(rows.info.numRows);

                        var data = [];
                      
                        var responses = [];

                        // group sorted result array by invoice number
                        for (var i = 0; i < rows.info.numRows; i++) {
                       
                            var item = rows[i];

                            var nextInvoice = '';
                                                       
                            var nextItem = rows[i + 1];
                            if (nextItem && nextItem.hasOwnProperty('invoiceNumber'))
                                nextInvoice = rows[i + 1].invoiceNumber;

                            var obj = {};

                            var invoiceObj = {};
                            var responseObj = {};
                            
                            responseObj.documentType = 'Response';
                            responseObj.documentNumber = item.responseNumber;
                            responseObj.originalDocumentNumber = item.invoiceNumber;
                            responseObj.status = item.responseStatus;
                            responseObj.date = parseInt(item.responseDate);
                            responseObj.amount = parseFloat(item.responseAmount);
                            responseObj.currency = item.responseCurrency;

                            responses.push(responseObj);

                            if (item.invoiceNumber != nextInvoice) { 

                                invoiceObj.documentType = 'Invoice';
                                invoiceObj.documentNumber = item.invoiceNumber;
                                invoiceObj.date = parseInt(item.invoiceDate);
                                invoiceObj.amount = parseFloat(item.invoiceAmount);
                                invoiceObj.currency = item.invoiceCurrency;                                

                                obj.original = invoiceObj;
                                obj.responses = responses;
                                
                                data.push(obj);

                                responses = [];
                                
                            }
                            
                        }

                        var msgResponse = JSON.stringify(data);
                        
                        // send to Gateway with msgResponse
                        cReporterOut.sendToQueue(qReporterOut, new Buffer.from(msgResponse));

                        dbconn.end();
                    });                    
                }
              
            }, { noAck: true });
        });
    });

});