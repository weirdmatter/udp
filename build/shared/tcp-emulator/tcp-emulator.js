"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var dgram_1 = require("dgram");
var crc_1 = require("crc");
var TCPEmulator = /** @class */ (function () {
    function TCPEmulator() {
        this.client = null;
        this.packets = [];
        this.receivedAckPackets = [];
        this.numberOfPacketsToSend = 1;
    }
    TCPEmulator.prototype.startConnection = function () {
        var _this = this;
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
        this.send(this.packets[0]);
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
        this.client = dgram_1.createSocket("udp4");
        console.log('CLIENT: Listeners iniciados...');
        this.client.on('message', function (content, info) {
            var receivedPacket = JSON.parse(Buffer.from(content).toString());
            ;
            console.log("CLIENT: Recebido ACK " + receivedPacket.ack + ".");
            var nextPacket = _this.packets.find(function (packet) {
                return receivedPacket.ack === packet.seq;
            });
            if (!nextPacket) {
                console.log('CLIENT: Fim de transmissão.');
                _this.flushPackets();
                return;
            }
            _this.receivedAckPackets.push(receivedPacket);
            var numberOfAcksToCurrPacket = _this.receivedAckPackets.map(function (pck) {
                return pck.ack === receivedPacket.ack;
            });
            // Se tem mais de um ack do mesmo pacote, então é necessário retransmitir
            if (numberOfAcksToCurrPacket.length > 1) {
                // tratamento de erro
            }
            else {
                // Remove os pacotes já enviados da lista de pacotes
                _this.packets = _this.packets.splice(_this.numberOfPacketsToSend);
                // Aumenta o número de pacotes a ser enviado a cada vez
                _this.numberOfPacketsToSend = _this.numberOfPacketsToSend * 2;
                // Separa os pacotes a serem enviados nesta leva
                var packetsToSend = _this.packets.slice(0, _this.numberOfPacketsToSend);
                // Envia os pacotes ao servidor
                _this.send.apply(_this, packetsToSend);
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
        var packets = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            packets[_i] = arguments[_i];
        }
        if (!this.packets.length) {
            console.log('CLIENT: Nenhum pacote encontrado para envio.');
            return;
        }
        packets.forEach(function (packet) {
            var _a;
            console.log("CLIENT: Enviando pacote " + packet.seq + "...");
            (_a = _this.client) === null || _a === void 0 ? void 0 : _a.send(Buffer.from(JSON.stringify(packet)), environment_1.environment.port, environment_1.environment.host, function (err) {
                if (err) {
                    console.error("CLIENT: Erro ao enviar pacote: " + err);
                }
                else {
                    console.log("CLIENT: Pacote " + packet.seq + " enviado.");
                }
            });
        });
    };
    TCPEmulator.prototype.buildPackets = function (data) {
    };
    TCPEmulator.prototype.buildAck = function (packet) {
        packet.ack = packet.seq + 1;
        return packet;
    };
    return TCPEmulator;
}());
exports.TCPEmulator = TCPEmulator;
