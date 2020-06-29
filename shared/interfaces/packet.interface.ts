export interface Packet {
    ack:   number;
    crc:   String;
    data:  any;
    pad?:  String;
    seq:   number;
}
