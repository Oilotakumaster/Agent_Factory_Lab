import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log("Connected to local server");
  const msg = {
    clientContent: {
      turns: [{
        role: "user",
        parts: [{ text: "Hello, testing 123" }]
      }],
      turnComplete: true
    }
  };
  ws.send(JSON.stringify(msg));
});

ws.on('message', (data) => {
  console.log("Received from server:", data.toString().substring(0, 100));
  process.exit(0);
});

ws.on('close', (code, reason) => {
  console.log("Closed:", code, reason.toString());
  process.exit(1);
});
