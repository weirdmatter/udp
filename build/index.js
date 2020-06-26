"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var tcp_emulator_1 = require("./shared/tcp-emulator/tcp-emulator");
var environment_1 = require("./environment");
var server = dgram_1.createSocket('udp4');
var receivedPackets = [];
var tcpEmulator = new tcp_emulator_1.TCPEmulator();
server.on('message', function (messageContent, rinfo) {
    // console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);
    var parsedPacket = JSON.parse(messageContent.toString());
    // Armazenar o pacote recebido
    receivedPackets.push(parsedPacket);
    // Monta o pacote de ack com base no pacote recebido e reenvia para o client
    var ackPacket = tcpEmulator.buildAck(parsedPacket);
    server.send(Buffer.from(JSON.stringify(ackPacket)), rinfo.port, rinfo.address, function (error) {
        if (error) {
            console.error("SERVIDOR: Erro ao enviar ACK " + ackPacket.ack + ". Erro - " + error);
        }
        else {
            console.log("SERVIDOR: ACK " + ackPacket.ack + " enviado.");
        }
    });
});
server.bind(environment_1.environment.port);
