import { environment }          from '../../environment';
import { createSocket, Socket } from 'dgram';
import { Packet }               from '../interfaces/packet.interface';
import { crc32 }                from 'crc';



export class TCPEmulator {

    private client                  : Socket | null;
    private packets                 : Packet[];
    private receivedAckPackets      : Packet[];
    private numberOfPacketsToSend   : number;

    constructor() {
        this.client                 = null;
        this.packets                = [];
        this.receivedAckPackets     = [];
        this.numberOfPacketsToSend  = 1;
    }
    
    startConnection() {
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
        this.client = createSocket("udp4");
        console.log('CLIENT: Listeners iniciados...');
        

        this.client!.on('message', (content : Buffer, info) => {
            
            const receivedPacket = JSON.parse(Buffer.from(content).toString());;

            console.log(`CLIENT: Recebido ACK ${receivedPacket.ack}.`);
            
            const nextPacket = this.packets.find((packet : Packet) => {
                return receivedPacket.ack === packet.seq
            });

            if (!nextPacket) {
                console.log('CLIENT: Fim de transmissão.');
                this.flushPackets();
                return;
            }

            this.receivedAckPackets.push(receivedPacket);

            const numberOfAcksToCurrPacket = this.receivedAckPackets.map((pck : Packet) => {
                return pck.ack === receivedPacket.ack;
            });

            // Se tem mais de um ack do mesmo pacote, então é necessário retransmitir
            if (numberOfAcksToCurrPacket.length > 1) { 
                // tratamento de erro
            }
            else {
                // Remove os pacotes já enviados da lista de pacotes
                this.packets = this.packets.splice(this.numberOfPacketsToSend);

                // Aumenta o número de pacotes a ser enviado a cada vez
                this.numberOfPacketsToSend = this.numberOfPacketsToSend * 2;

                // Separa os pacotes a serem enviados nesta leva
                const packetsToSend = this.packets.slice(0, this.numberOfPacketsToSend);
                
                // Envia os pacotes ao servidor
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

    send(...packets : Packet[]) {
        if (!this.packets.length) {
            console.log('CLIENT: Nenhum pacote encontrado para envio.');
            return;
        }

        packets.forEach((packet : Packet) => {
            
            console.log(`CLIENT: Enviando pacote ${packet.seq}...`);

            this.client?.send(
                Buffer.from(JSON.stringify(packet)), 
                environment.port, 
                environment.host,
                (err) => {
                    if (err) { console.error(`CLIENT: Erro ao enviar pacote: ${err}`); }
                    else     { console.log(`CLIENT: Pacote ${packet.seq} enviado.`); }
                }
            
                );
        });
        
    }

    buildPackets(data : any) {

    }

    buildAck(packet : Packet) : Packet {
        packet.ack = packet.seq + 1;
        return packet;
    }
}