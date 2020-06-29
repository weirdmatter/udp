import { createSocket } from "dgram";
import { Packet } from "./shared/interfaces/packet.interface";
import { TCPEmulator } from './shared/tcp-emulator/tcp-emulator';
import { environment } from './environment';
import fs from 'fs';

const server = createSocket('udp4');
const receivedPackets: Packet[] = [];
const tcpEmulator = new TCPEmulator();

server.on('message', (messageContent, rinfo) => {
    // console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);

    const parsedPacket = JSON.parse(messageContent.toString());

    if (parsedPacket.data === 'END_OF_FILE') {
        let text_final = '';

        console.log('Pacote final recebido. Iniciando reconstrução do arquivo...');

        receivedPackets.forEach(packet => {
            if (packet.data !== 'END_OF_FILE' && packet.data !== 'SYN' && packet.data !== 'ACK_RECEIVED') {
                text_final += packet.data;
            }
        });

        fs.writeFile('resultado_recebimento', text_final, (err) => {
            if (err) {
                return console.log(err);
            }
        })
    } else {

        // Armazenar o pacote recebido
        receivedPackets.push(parsedPacket);

        // Monta o pacote de ack com base no pacote recebido e reenvia para o client
        const ackPacket = tcpEmulator.buildAck(parsedPacket);


        server.send(
            Buffer.from(JSON.stringify(ackPacket)),
            rinfo.port,
            rinfo.address,
            (error) => {
                if (error) {
                    console.error(`SERVIDOR: Erro ao enviar ACK ${ackPacket.ack}. Erro - ${error}`);
                }
                else {
                    console.log(`SERVIDOR: ACK ${ackPacket.ack} enviado.`);
                }
            }
        );
    }
});

server.bind(environment.port);

