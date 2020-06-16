"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var server = dgram_1.createSocket('udp4');
server.on('message', function (messageContent, rinfo) {
    console.log("Servidor recebeu '" + messageContent + "' de " + rinfo.address + ":" + rinfo.port);
    server.send(messageContent, rinfo.port, 'localhost', function (error) {
        if (error)
            throw error;
        console.log("Servidor responde '" + messageContent + "' para " + rinfo.address + ":" + rinfo.port);
    });
});
server.bind(5800);
