import { createSocket, Socket } from 'dgram';
import * as fs                  from 'fs'
import { exec }                 from 'child_process';
import { Packet }               from '../shared/interfaces/packet.interface';
import { crc32 }                from 'crc';

const host          : string = '127.0.0.1';
const port          : number =  5800;
const smallFilePath : string = './misc/smallfile.txt';
const largeFilePath : string = './misc/largefile.txt';
const client        : Socket = createSocket("udp4");

// Pegar arquivo
// Gerar um buffer
// Quebrar o buffer em um array
// Cada pacote deve ter 512 bytes.


client.on('message', (messageContent, info) => {
    console.log(`Client recebeu a mensagem '${messageContent.toString()}' do servidor.`);
    client.close();
});




fs.readFile(largeFilePath, (err, content) => {
    const messageBuffer = Buffer.from(content);

    const packet : Packet = { ack: 0, crc: '', data: Buffer.from(''), seq: 0 }
    const packet_mod : Packet = { ack: 0, crc: 'aa', data: Buffer.from(''), seq: 0 }
    const packet_mad : Packet = { ack: 0, crc: '', data: Buffer.from('a'), seq: 0 }
    const packet_mud : Packet = { ack: 0, crc: 'a', data: Buffer.from('a'), seq: 0 }
    const packet_mid : Packet = { ack: 0, crc: 'a', data: Buffer.from('a'), seq: 0 }

    console.log(`packet size: ${Buffer.byteLength(Buffer.from(JSON.stringify(packet)))}`);
    console.log(`packet size mod: ${Buffer.byteLength(Buffer.from(JSON.stringify(packet_mod)))}`);
    console.log(`packet size mad: ${Buffer.byteLength(Buffer.from(JSON.stringify(packet_mad)))}`);
    console.log(`packet size mud: ${Buffer.byteLength(Buffer.from(JSON.stringify(packet_mud)))}`);
    console.log(`packet size mid: ${Buffer.byteLength(Buffer.from(JSON.stringify(packet_mid)))}`);

    var aaa = crc32('hello').toString(16);
    console.log(` aaa ${aaa}`);

    console.log(`buffer size: ${Buffer.byteLength(messageBuffer)}`);
    
    client.send(messageBuffer, 0, messageBuffer.length, port, host, (err, bytes) => {
        if (err) throw err;
        
    });
});