"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { createSocket } from "dgram";
var tcp_emulator_1 = require("./shared/tcp-emulator/tcp-emulator");
// const server = createSocket('udp4');
// server.on('message', (messageContent, rinfo) => {
//     console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);
//     server.send(messageContent, rinfo.port, 'localhost', (error) => {
//         if (error) throw error
//         console.log(`Servidor responde '${messageContent}' para ${rinfo.address}:${rinfo.port}`);
//     });
// });
// server.bind(5800);
var tcpEmulator = new tcp_emulator_1.TCPEmulator();
tcpEmulator.startServerListeners();
