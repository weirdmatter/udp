import { environment }          from '../../environment';
import { createSocket, Socket } from 'dgram';
import { Packet }               from '../interfaces/packet.interface';
import { crc32 } from 'crc';



export class TCPEmulator {

    private client  : Socket | null;
    private packets : Packet[];

    constructor() {
        this.client     = null
        this.packets    = [];
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
        this.client?.on('', (content : Packet, info) => {
            console.log(`Client recebeu a mensagem '${content.data.toString()}' do servidor.`);
            this.closeConnection();
        });
    }

    private closeConnection() {
        this.flushClient();
        this.flushPackets();
    }

    send(data : Packet) {

    }

    buildPacket(file : any) {

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