"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var tcp_emulator_1 = require("./shared/tcp-emulator/tcp-emulator");
var environment_1 = require("./environment");
var fs_1 = __importDefault(require("fs"));
var server = dgram_1.createSocket('udp4');
var receivedPackets = [];
var tcpEmulator = new tcp_emulator_1.TCPEmulator();
server.on('message', function (messageContent, rinfo) {
    // console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);
    var parsedPacket = JSON.parse(messageContent.toString());
    if (parsedPacket.data === 'END_OF_FILE') {
        var text_final_1 = '';
        console.log('Pacote final recebido. Iniciando reconstrução do arquivo...');
        receivedPackets.forEach(function (packet) {
            if (packet.data !== 'END_OF_FILE' && packet.data !== 'SYN' && packet.data !== 'ACK_RECEIVED') {
                text_final_1 += packet.data;
            }
        });
        fs_1.default.writeFile('resultado_recebimento', text_final_1, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }
    else {
        // Armazenar o pacote recebido
        receivedPackets.push(parsedPacket);
        // Monta o pacote de ack com base no pacote recebido e reenvia para o client
        var ackPacket_1 = tcpEmulator.buildAck(parsedPacket);
        server.send(Buffer.from(JSON.stringify(ackPacket_1)), rinfo.port, rinfo.address, function (error) {
            if (error) {
                console.error("SERVIDOR: Erro ao enviar ACK " + ackPacket_1.ack + ". Erro - " + error);
            }
            else {
                console.log("SERVIDOR: ACK " + ackPacket_1.ack + " enviado.");
            }
        });
    }
});
server.bind(environment_1.environment.port);
