# InvoiceFlow

## Outline

A invoice flow application for invoice collect, parse, persist and report.
This application uses Node.js, RabbitMQ and MariaDB.

## Design

Architecture:

![alt tag](https://github.com/JohnHou2017/InvoiceFlow/blob/master/Gateway/Doc/InvoiceFlowArchitecture.png)

## Dev Environment
```
1. Visual Studio 2015.
2. Node.js.
3. RabbitMQ.
4. MariaDB.
```
## Microservices
```
1. Collecter: a Nodejs application for invoice collect.
2. Parser: a Nodejs application for invoice parse.
3. Persister: a Nodejs application for invoice persist.
4. Reporter: a Nodejs application for invoice report.
5. Gateway: a Nodejs server to dispatch and schedule message between above applications.
```
## Run
```
Start microservices and gateway in DOS:

1. Collecter: node collector.js
2. Parser: node parser.js
3. Persister: node persister.js
4. Reporter: node reporter.js
5. Gateway: node server.js

Start process in Browser: http://localhost:1337

```
## Run Result

![alt tag](https://github.com/JohnHou2017/InvoiceFlow/blob/master/Gateway/Doc/ReporterOutput.png)
