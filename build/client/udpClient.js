"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var dgram_1 = require("dgram");
var fs = __importStar(require("fs"));
var crc_1 = require("crc");
var host = '127.0.0.1';
var port = 5800;
var smallFilePath = './misc/smallfile.txt';
var largeFilePath = './misc/largefile.txt';
var client = dgram_1.createSocket("udp4");
// Pegar arquivo
// Gerar um buffer
// Quebrar o buffer em um array
// Cada pacote deve ter 512 bytes.
client.on('message', function (messageContent, info) {
    console.log("Client recebeu a mensagem '" + messageContent.toString() + "' do servidor.");
    client.close();
});
fs.readFile(largeFilePath, function (err, content) {
    var messageBuffer = Buffer.from(content);
    var packet = { ack: 0, crc: '', data: Buffer.from(''), sec: 0 };
    var packet_mod = { ack: 0, crc: 'aa', data: Buffer.from(''), sec: 0 };
    var packet_mad = { ack: 0, crc: '', data: Buffer.from('a'), sec: 0 };
    var packet_mud = { ack: 0, crc: 'a', data: Buffer.from('a'), sec: 0 };
    var packet_mid = { ack: 0, crc: 'a', data: Buffer.from('a'), sec: 0 };
    console.log("packet size: " + Buffer.byteLength(Buffer.from(JSON.stringify(packet))));
    console.log("packet size mod: " + Buffer.byteLength(Buffer.from(JSON.stringify(packet_mod))));
    console.log("packet size mad: " + Buffer.byteLength(Buffer.from(JSON.stringify(packet_mad))));
    console.log("packet size mud: " + Buffer.byteLength(Buffer.from(JSON.stringify(packet_mud))));
    console.log("packet size mid: " + Buffer.byteLength(Buffer.from(JSON.stringify(packet_mid))));
    var aaa = crc_1.crc32('hello').toString(16);
    console.log(" aaa " + aaa);
    console.log("buffer size: " + Buffer.byteLength(messageBuffer));
    client.send(messageBuffer, 0, messageBuffer.length, port, host, function (err, bytes) {
        if (err)
            throw err;
    });
});
