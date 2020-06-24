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

        this.send();
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

        console.log('CLIENT: Listeners iniciados...');
        

        this.client?.on('message', (content : Packet, info) => {

            console.log('RECEBENDO ALGUMA COISA');
            

            const nextPacket = this.packets.find((packet : Packet) => {
                return content.ack === packet.seq
            });

            if (!nextPacket) {
                console.log('CLIENT: Fim de transmissão.');
                this.flushPackets();
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
                // Limpa a lista de acks recebidos
                this.flushReceivedAckPackets();
            
                // Remove o pacote já enviado da lista de pacotes
                this.packets.splice(0, this.numberOfPacketsToSend);
                
                // Aumenta o número de pacotes a ser enviado a cada vez
                this.numberOfPacketsToSend = this.numberOfPacketsToSend * 2;
            
                this.packets = this.packets.slice(0, this.numberOfPacketsToSend);
                this.send();
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

    send() {
        if (!this.packets.length) {
            console.log('CLIENT: Nenhum pacote encontrado para envio.');
            return;
        }
        console.log(`CLIENT: Enviando pacote ${this.packets[0].seq}...`);
        this.client?.send(
            Buffer.from(JSON.stringify(this.packets[0])), 
            environment.port, 
            environment.host,
            (err) => {
                if (err) { console.error(`CLIENT: Erro ao enviar pacote: ${err}`); }
                else     { console.log(`CLIENT: Pacote ${this.packets[0].seq} enviado.`); }
            }
        );
    }

    buildPackets(data : any) {

        const array_packets : Packet[] = [];

        const buffer_from_data = Buffer.from(data);

        let crc_data;

        for(let i = 0; i < 900000; i++) {

            crc_data = crc32(Buffer.from('SYN')).toString(16)
            

            let packet : Packet = {ack: 0, crc: crc_data, data: Buffer.from('aaa'), seq: i};
        }
        //constroi o conteudo do pacote antes de inserir dados.
        
        array_packets.push(packet);

        /**
         *      ack:   number;
                crc:   String;
                data:  Buffer;
                pad?:  String;
                seq:   number;
         */

    }

    buildAck(packet : Packet) : Packet {
        packet.ack++;
        return packet;
    }
}