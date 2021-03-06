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
            crc  : crc32('SYN').toString(16),
            data : 'SYN',
            seq  : 0,
        };

        const ackReceived : Packet = {
            ack  : 0,
            crc  : crc32('ACK_RECEIVED').toString(16),
            data : 'ACK_RECEIVED',
            seq  : 1,
        };

        const endOfFile : Packet = { 
            ack  : 0,
            crc  : crc32('END_OF_FILE').toString(16),
            data : 'END_OF_FILE',
            seq  : 2,
        }

        this.packets.push(syn);
        this.packets.push(ackReceived);

        this.addPadding(this.packets);

        this.send(this.packets[0]);
    }

    private addPadding(packets : Packet[]): void {
        packets.forEach((packet : Packet) => {
            while (Buffer.byteLength(JSON.stringify(packet), 'utf8') < 512) {
                packet.pad += '0';
            }
            // console.log(`O pacote ${packet.seq} tem ${Buffer.byteLength(JSON.stringify(packet), 'utf8')} bytes`);
        }); 
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

            if(!this.packets.length) {
                console.log('CLIENT: Fim de transmissão.');
            }
            
            const receivedPacket = JSON.parse(Buffer.from(content).toString());

            console.log(`CLIENT: Recebido ACK ${receivedPacket.ack}.`);
            
            if (receivedPacket.data === 'END_OF_FILE') {
                this.send(receivedPacket);
                this.flushPackets();
                return;
            }

            this.receivedAckPackets.push(receivedPacket);

            const numberOfAcksToCurrPacket = this.receivedAckPackets.map((pck : Packet) => {
                return pck.ack === receivedPacket.ack;
            });

            // Se tem mais de um ack do mesmo pacote, então é necessário retransmitir
 
                // Remove os pacotes já enviados da lista de pacotes
                this.packets = this.packets.splice(this.numberOfPacketsToSend);

                // Aumenta o número de pacotes a ser enviado a cada vez
                this.numberOfPacketsToSend = 2 ^ this.numberOfPacketsToSend;

                // Separa os pacotes a serem enviados nesta leva
                const packetsToSend = this.packets.slice(0, this.numberOfPacketsToSend);
                
                // Envia os pacotes ao servidor
                this.send(...packetsToSend);

            
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

        console.log("Iniciando construção dos pacotes com o buffer de dados...");
        
        //crc will always have 8 bytes.
        const array_packets : Packet[] = [];

        //iteration must stop in 512 - 8
        //since crc will always have 8 bytes.
        //iterate = 504
        //now, take 504 - packet size.
        //is the total amount to set data in each packet.

        const buffer_from_data = Buffer.from(data);

        const crc_size = 8;

        let packet : Packet = {ack: 0, crc: '', data: '', seq: 1};

        let iteration_limit = 512 - Buffer.byteLength(JSON.stringify(packet)) - crc_size;
        let offset_iteration = 512 - Buffer.byteLength(JSON.stringify(packet)) - crc_size;

        let packet_data = '';

        let i = 0;
        let packet_count = 0;

        while(true) {

            packet_count++;

            packet.seq = packet_count;

            for(i; i < iteration_limit; i++) {
                packet_data = packet_data + buffer_from_data.toString().charAt(i);   
            }
            
            packet_data = packet_data.replace(/(\r\n|\n|\r)/gm,'');
            
            i = iteration_limit;
            
            iteration_limit = iteration_limit + offset_iteration;
            
            packet.data = packet_data;
            packet.crc = crc32(packet_data).toString(16);
            
            array_packets.push(packet);
            
            packet =  {ack: 0, crc: '', data: '', seq: packet_count};
            packet_data = '';

            if(iteration_limit > Buffer.byteLength(data)) {
                packet_count++;

                packet.seq = packet_count;


                for(i; i < iteration_limit; i++) {
                    packet_data = packet_data + buffer_from_data.toString().charAt(i);   
                }

                packet_data = packet_data.replace(/(\r\n|\n|\r)/gm,'');

                packet.data = packet_data;
                packet.crc = crc32(packet_data).toString(16);
            
                array_packets.push(packet);

                console.log('Fim da construção!');
                break;
            }
        }

        console.log("\nPacotes construídos.");
        console.log("\nIniciando envio dos pacotes para o servidor.");

        const final_packet = {ack: 0, crc: '', data: 'END_OF_FILE', seq: packet_count + 1};

        array_packets.push(final_packet);


        this.packets = array_packets;

        this.addPadding(this.packets);

        return array_packets[0];
    }

    buildAck(packet : Packet) : Packet {
        packet.ack = packet.seq + 1;
        return packet;
    }
}