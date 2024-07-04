import net from 'net';
import { readHeader, writeHeader } from './utils.js';
import { HANDLER_ID, MAX_MESSAGE_LENGTH, TOTAL_LENGTH_SIZE } from './constants.js';
import handlers from './handlers/index.js';

const PORT = 5555;

const server = net.createServer((socket) => {
  console.log(`Client connected from: ${socket.remoteAddress}:${socket.remotePort}`);

  socket.on('data', (data) => {
    const buffer = Buffer.from(data);
    const { handlerId, length } = readHeader(buffer);
    console.log(`handlerId: ${handlerId}`);
    console.log(`length: ${length}`);

    if (length > MAX_MESSAGE_LENGTH) {
      console.error(`Error: Message length ${length}`);
      socket.write(`Error: Message too long`);
      socket.end();
      return;
    }

    const handler = handlers[handlerId];

    if (!handler) {
      console.error(`Error: No handler found for ID ${handlerId}`);
      socket.write(`Error: Invalid handler ID ${handlerId}`);
      socket.end();
      return;
    }

    const headerSize = TOTAL_LENGTH_SIZE + HANDLER_ID;
    const message = buffer.slice(headerSize);

    console.log(`client 에게 받은 메시지: ${message}`);

    const responseMessage = handler(message);
    const responseBuffer = Buffer.from(responseMessage);

    const header = writeHeader(responseBuffer.length, handlerId);
    const packet = Buffer.concat([header, responseBuffer]);

    socket.write(packet);
  });

  socket.on('end', () => {
    console.log(`Client disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
  });

  socket.on('error', (err) => {
    console.error('Socket error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`Echo server listening on port ${PORT}`);
  console.log(server.address());
});
