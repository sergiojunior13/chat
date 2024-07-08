/*
Código feito por Sérgio Jr. (https://github.com/sergiojunior13)

Jesus te ama!
*/

const WebSocket = require("ws");
const server = new WebSocket.Server({ port: 8080, path: "/server" });

const clients = [];
const messages = [];

server.on("connection", socket => {
  clients.push(socket);

  socket.on("message", messageData => {
    const message = JSON.parse(messageData);

    if (message.type == "connection") {
      console.log(`Cliente "${message.owner}" conectado.`);

      const allPastMessagesStringified = JSON.stringify({ messages, type: "history" });
      socket.send(allPastMessagesStringified);

      clients.forEach(client => {
        if (client !== socket && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ content: `${message.owner} entrou`, type: "tag" }));
        }
      });
      return;
    }

    messages.push(message);

    clients.forEach(client => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  });

  socket.on("close", reason => {
    const index = clients.indexOf(socket);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });

  socket.on("error", error => {
    console.log("Erro:", error.message);
  });
});

server.on("listening", () =>
  console.log("\x1b[1m\x1b[38;2;79;70;229mServidor WebSocket rodando\x1b[0m")
);
