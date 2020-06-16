import { createSocket, Socket } from 'dgram';
import * as fs from 'fs'
import { exec } from 'child_process';

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

    console.log(`buffer size: ${Buffer.byteLength(messageBuffer)}`);
    
    client.send(messageBuffer, 0, messageBuffer.length, port, host, (err, bytes) => {
        if (err) throw err;
        
    });
});