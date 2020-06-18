export interface Packet {
    ack:   Number;
    crc:   String;
    data:  Buffer;
    pad?:  String;
    seq:   Number;
}


