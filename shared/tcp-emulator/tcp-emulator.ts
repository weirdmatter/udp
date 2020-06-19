import { environment }          from '../../environment';
import { createSocket, Socket } from 'dgram';
import { Packet } from '../interfaces/packet.interface';
import { crc32 } from 'crc';



export class TCPEmulator {

    private client              : Socket | null;
    private packets             : Packet[];
    private receivedAckPackets  : Packet[];

    constructor() {
        this.client                 = null
        this.packets                = [];
        this.receivedAckPackets     = [];
    }
    
    startConnection() {
        this.client = createSocket("udp4");
        this.startClientListeners();
        
        const syn : Packet = {
            ack  : 0,
            crc  : crc32(Buffer.from('SYN')).toString(16),
            data : Buffer.from('SYN'),
            seq  : 0,
        };

        const ackReceived : Packet = {
            ack  : 0,
            crc  : crc32(Buffer.from('ACK_RECEIVED')).toString(16),
            data : Buffer.from('ACK_RECEIVED'),
            seq  : 1,
        };

        this.packets.push(syn);
        this.packets.push(ackReceived);

        this.packets = this.packets.map((packet : Packet) => {
            return this.addPadding(packet);
        });

        this.send(this.packets[0]);

    }

    private addPadding(packet : Packet) : Packet {
        return packet;
    }

    private flushPackets() {
        this.packets = [];
    }

    private flushClient() {
        this.client = null;
    }

    private startClientListeners() {

        let numberOfPacketsToSend = 1;
        
        this.client?.on('ack', (content : Packet, info) => {

            const nextPacket = this.packets.find((packet : Packet) => {
                return content.ack === packet.seq
            });

            if (!nextPacket) {
                console.log('Fim de transmissão.');
                // this.closeConnection();
                return;
            }

            const ackAlreadyReceived = this.receivedAckPackets.find((pck : Packet) => {
                return pck.ack === content.ack;
            });

            if (ackAlreadyReceived) {
                this.receivedAckPackets.push(content);
                // tratamento de erro
            }

            else {
                this.flushReceivedAckPackets();
                numberOfPacketsToSend++;
                
                const startingPacketIndex = 1 + this.packets.findIndex((packet : Packet) => {
                    return packet.seq === content.ack--;
                });

                /**
                 * @TODO esta logica do slice precisa ser revista 
                 * @TODO lembrar de implementar lógica de fila no envio dos pacotes (pode ser no método send)
                 * */
                const packetsToSend : Packet[] = this.packets.slice(startingPacketIndex, startingPacketIndex + numberOfPacketsToSend);
                this.send(...packetsToSend);
            }
        });
    }

    private closeConnection() {
        this.flushClient();
        this.flushPackets();
    }

    private flushReceivedAckPackets() {
        this.receivedAckPackets = [];
    }

    send(...data : Packet[]) {

    }

    buildPacket(data : any) {

    }

    buildAck(packet : Packet) {

    }

    startServerListeners() {
        const server = createSocket('udp4');
        
        server.on('message', (messageContent, rinfo) => {
            console.log(`Servidor recebeu '${messageContent}' de ${rinfo.address}:${rinfo.port}`);
            
            server.send(messageContent, rinfo.port, 'localhost', (error) => {
                if (error) throw error
                console.log(`Servidor responde '${messageContent}' para ${rinfo.address}:${rinfo.port}`);
            });
        });
        server.bind(environment.port);
    }


}