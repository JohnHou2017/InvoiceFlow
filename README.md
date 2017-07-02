# InvoiceFlow

## Outline

A invoice flow application for invoice collect, parse, persist and report.
This application uses Node.js, RabbitMQ and MariaDB.

## Design

Architecture:

![alt tag](https://github.com/JohnHou2017/InvoiceFlow/blob/master/Gateway/Doc/ReporterOutput.png)

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
## Result

![alt tag](https://github.com/JohnHou2017/InvoiceFlow/blob/master/Gateway/Doc/ReporterOutput.png)
