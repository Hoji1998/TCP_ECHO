import net from 'net';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, TOTAL_LENGTH_SIZE } from './constants.js';

// 서버에 연결할 호스트와 포트
const HOST = 'localhost';
const PORT = 5555;

const client = new net.Socket();

client.connect(PORT, HOST, () => {
  console.log('Connected to server');

  const message = 'Hello';
  const test = Buffer.from(message);

  const header = writeHeader(test.length, 11);
  const packet = Buffer.concat([header, test]);
  client.write(packet);
});

client.on('data', (data) => {
  const buffer = Buffer.from(data);

  const { handlerId, length } = readHeader(buffer);
  console.log(`handlerId: ${handlerId}`);
  console.log(`length: ${length}`);

  const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
  const message = buffer.slice(headerSize);

  console.log(`server 에게 받은 메시지: ${message}`);
});

client.on('close', () => {
  console.log('Connection closed');
});

client.on('error', (err) => {
  console.error('Client error:', err);
});
