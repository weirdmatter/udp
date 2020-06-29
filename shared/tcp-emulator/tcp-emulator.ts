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
            
            packet_data = packet_data.replace(/(\r\n|\n|\r)/gm,'');;
            
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

        const final_packet = {ack: 0, crc: '', data: 'end_of_file', seq: packet_count + 1};

        array_packets.push(final_packet);

        return array_packets;

    }

    buildAck(packet : Packet) : Packet {
        packet.ack = packet.seq + 1;
        return packet;
    }
}