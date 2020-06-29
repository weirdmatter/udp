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
        this.sizeof = require('object-sizeof');
    }
    TCPEmulator.prototype.startConnection = function () {
        this.startClientListeners();
        var syn = {
            ack: 0,
            crc: crc_1.crc32('SYN').toString(16),
            data: 'SYN',
            seq: 0,
        };
        var ackReceived = {
            ack: 0,
            crc: crc_1.crc32('ACK_RECEIVED').toString(16),
            data: 'ACK_RECEIVED',
            seq: 1,
        };
        var endOfFile = {
            ack: 0,
            crc: crc_1.crc32('END_OF_FILE').toString(16),
            data: 'END_OF_FILE',
            seq: 2,
        };
        this.packets.push(syn);
        this.packets.push(ackReceived);
        this.addPadding(this.packets);
        this.send(this.packets[0]);
    };
    TCPEmulator.prototype.addPadding = function (packets) {
        var _this = this;
        packets.forEach(function (packet) {
            while (_this.sizeof(packet) < 512) {
                packet.pad += '0';
            }
            console.log("O pacote " + packet.seq + " tem " + _this.sizeof(packet) + " bytes");
        });
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
            if (!_this.packets.length) {
                console.log('CLIENT: Fim de transmissão.');
            }
            var receivedPacket = JSON.parse(Buffer.from(content).toString());
            console.log("CLIENT: Recebido ACK " + receivedPacket.ack + ".");
            if (receivedPacket.data === 'END_OF_FILE') {
                _this.send(receivedPacket);
                _this.flushPackets();
                return;
            }
            _this.receivedAckPackets.push(receivedPacket);
            var numberOfAcksToCurrPacket = _this.receivedAckPackets.map(function (pck) {
                return pck.ack === receivedPacket.ack;
            });
            // Se tem mais de um ack do mesmo pacote, então é necessário retransmitir
            // Remove os pacotes já enviados da lista de pacotes
            _this.packets = _this.packets.splice(_this.numberOfPacketsToSend);
            // Aumenta o número de pacotes a ser enviado a cada vez
            _this.numberOfPacketsToSend = 2 ^ _this.numberOfPacketsToSend;
            // Separa os pacotes a serem enviados nesta leva
            var packetsToSend = _this.packets.slice(0, _this.numberOfPacketsToSend);
            // Envia os pacotes ao servidor
            _this.send.apply(_this, packetsToSend);
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
        console.log("Iniciando construção dos pacotes com o buffer de dados...");
        //crc will always have 8 bytes.
        var array_packets = [];
        //iteration must stop in 512 - 8
        //since crc will always have 8 bytes.
        //iterate = 504
        //now, take 504 - packet size.
        //is the total amount to set data in each packet.
        var buffer_from_data = Buffer.from(data);
        var crc_size = 8;
        var packet = { ack: 0, crc: '', data: '', seq: 1 };
        var iteration_limit = 512 - Buffer.byteLength(JSON.stringify(packet)) - crc_size;
        var offset_iteration = 512 - Buffer.byteLength(JSON.stringify(packet)) - crc_size;
        var packet_data = '';
        var i = 0;
        var packet_count = 0;
        while (true) {
            packet_count++;
            packet.seq = packet_count;
            for (i; i < iteration_limit; i++) {
                packet_data = packet_data + buffer_from_data.toString().charAt(i);
            }
            packet_data = packet_data.replace(/(\r\n|\n|\r)/gm, '');
            i = iteration_limit;
            iteration_limit = iteration_limit + offset_iteration;
            packet.data = packet_data;
            packet.crc = crc_1.crc32(packet_data).toString(16);
            array_packets.push(packet);
            packet = { ack: 0, crc: '', data: '', seq: packet_count };
            packet_data = '';
            if (iteration_limit > Buffer.byteLength(data)) {
                packet_count++;
                packet.seq = packet_count;
                for (i; i < iteration_limit; i++) {
                    packet_data = packet_data + buffer_from_data.toString().charAt(i);
                }
                packet_data = packet_data.replace(/(\r\n|\n|\r)/gm, '');
                packet.data = packet_data;
                packet.crc = crc_1.crc32(packet_data).toString(16);
                array_packets.push(packet);
                console.log('Fim da construção!');
                break;
            }
        }
        console.log("\nPacotes construídos.");
        console.log("\nIniciando envio dos pacotes para o servidor.");
        var final_packet = { ack: 0, crc: '', data: 'END_OF_FILE', seq: packet_count + 1 };
        array_packets.push(final_packet);
        this.packets = array_packets;
        this.addPadding(this.packets);
        return array_packets[0];
    };
    TCPEmulator.prototype.buildAck = function (packet) {
        packet.ack = packet.seq + 1;
        return packet;
    };
    return TCPEmulator;
}());
exports.TCPEmulator = TCPEmulator;
