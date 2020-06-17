import { TCPEmulatorInterface } from '../interfaces/tcp-emulator.interface';
import { environment }          from '../../environment';
import { createSocket, Socket } from 'dgram';
import { Packet }               from '../interfaces/packet.interface';



export class TCPEmulator implements TCPEmulatorInterface {

    constructor() {

    }
    
    startConnection() {

    }

    closeConnection() {

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