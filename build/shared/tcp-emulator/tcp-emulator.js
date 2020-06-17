"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var environment_1 = require("../../environment");
var dgram_1 = require("dgram");
var TCPEmulator = /** @class */ (function () {
    function TCPEmulator() {
    }
    TCPEmulator.prototype.startConnection = function () {
    };
    TCPEmulator.prototype.closeConnection = function () {
    };
    TCPEmulator.prototype.send = function (data) {
    };
    TCPEmulator.prototype.buildPacket = function (file) {
    };
    TCPEmulator.prototype.buildAck = function (packet) {
    };
    TCPEmulator.prototype.startServerListeners = function () {
        var server = dgram_1.createSocket('udp4');
        server.on('message', function (messageContent, rinfo) {
            console.log("Servidor recebeu '" + messageContent + "' de " + rinfo.address + ":" + rinfo.port);
            server.send(messageContent, rinfo.port, 'localhost', function (error) {
                if (error)
                    throw error;
                console.log("Servidor responde '" + messageContent + "' para " + rinfo.address + ":" + rinfo.port);
            });
        });
        server.bind(environment_1.environment.port);
    };
    return TCPEmulator;
}());
exports.TCPEmulator = TCPEmulator;
