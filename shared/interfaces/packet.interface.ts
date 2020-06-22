export interface Packet {
    ack:   number;
    crc:   String;
    data:  Buffer;
    pad?:  String;
    seq:   number;
}
