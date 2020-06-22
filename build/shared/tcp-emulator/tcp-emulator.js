"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var dgram_1 = require("dgram");
var crc_1 = require("crc");
var TCPEmulator = /** @class */ (function () {
    function TCPEmulator() {
        this.client = dgram_1.createSocket("udp4");
        this.packets = [];
        this.receivedAckPackets = [];
        this.numberOfPacketsToSend = 1;
    }
    TCPEmulator.prototype.startConnection = function () {
        var _this = this;
        this.client = dgram_1.createSocket("udp4");
        this.startClientListeners();
        var syn = {
            ack: 0,
            crc: crc_1.crc32(Buffer.from('SYN')).toString(16),
            data: Buffer.from('SYN'),
            seq: 0,
        };
        var ackReceived = {
            ack: 0,
            crc: crc_1.crc32(Buffer.from('ACK_RECEIVED')).toString(16),
            data: Buffer.from('ACK_RECEIVED'),
            seq: 1,
        };
        this.packets.push(syn);
        this.packets.push(ackReceived);
        this.packets = this.packets.map(function (packet) {
            return _this.addPadding(packet);
        });
        this.send();
    };
    TCPEmulator.prototype.addPadding = function (packet) {
        return packet;
    };
    TCPEmulator.prototype.flushPackets = function () {
        this.packets = [];
    };
    TCPEmulator.prototype.flushClient = function () {
        this.client = null;
    };
    TCPEmulator.prototype.startClientListeners = function () {
        var _this = this;
        var _a;
        console.log('CLIENT: Listeners iniciados');
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.on('message', function (content, info) {
            console.log('RECEBENDO ALGUMA COISA');
            var nextPacket = _this.packets.find(function (packet) {
                return content.ack === packet.seq;
            });
            if (!nextPacket) {
                console.log('CLIENT: Fim de transmissão.');
                _this.flushPackets();
                return;
            }
            var ackAlreadyReceived = _this.receivedAckPackets.find(function (pck) {
                return pck.ack === content.ack;
            });
            if (ackAlreadyReceived) {
                _this.receivedAckPackets.push(content);
                // tratamento de erro
            }
            else {
                // Limpa a lista de acks recebidos
                _this.flushReceivedAckPackets();
                // Remove o pacote já enviado da lista de pacotes
                _this.packets.splice(0, _this.numberOfPacketsToSend);
                // Aumenta o número de pacotes a ser enviado a cada vez
                _this.numberOfPacketsToSend = _this.numberOfPacketsToSend * 2;
                _this.packets = _this.packets.slice(0, _this.numberOfPacketsToSend);
                _this.send();
            }
        });
    };
    TCPEmulator.prototype.closeConnection = function () {
        this.flushClient();
        this.flushPackets();
    };
    TCPEmulator.prototype.flushReceivedAckPackets = function () {
        this.receivedAckPackets = [];
    };
    TCPEmulator.prototype.send = function () {
        var _this = this;
        var _a;
        if (!this.packets.length) {
            console.log('CLIENT: Nenhum pacote encontrado para envio.');
            return;
        }
        console.log("CLIENT: Enviando pacote " + this.packets[0].seq + "...");
        (_a = this.client) === null || _a === void 0 ? void 0 : _a.send(Buffer.from(JSON.stringify(this.packets[0])), environment_1.environment.port, environment_1.environment.host, function (err) {
            if (err) {
                console.error("CLIENT: Erro ao enviar pacote: " + err);
            }
            else {
                console.log("CLIENT: Pacote " + _this.packets[0].seq + " enviado.");
            }
        });
    };
    TCPEmulator.prototype.buildPackets = function (data) {
    };
    TCPEmulator.prototype.buildAck = function (packet) {
        packet.ack++;
        return packet;
    };
    return TCPEmulator;
}());
exports.TCPEmulator = TCPEmulator;
