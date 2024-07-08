/*
Código feito por Sérgio Jr. (https://github.com/sergiojunior13)

Jesus te ama!
*/

const messagesDivElement = document.getElementById("messages");
const messageInputElement = document.getElementById("message-input");
const sendMessageButtonElement = document.getElementById("send-message-button");

const userName = localStorage.getItem("username");

if (!userName) window.location.href = "/";

class Server {
  static connect() {
    const socket = new WebSocket(`ws://${new URL(window.location.href).hostname}:8080/server`);

    socket.onopen = () => {
      const connectionMessageStringified = JSON.stringify({ owner: userName, type: "connection" });
      socket.send(connectionMessageStringified);
    };

    socket.onerror = e => alert("Erro: " + e);

    return socket;
  }
}

class MessagesListHTML {
  static add(message) {
    messagesDivElement.innerHTML += `<div class="${
      message.owner == userName ? "own-message" : "message"
    }"><span>${message.owner}</span><p>${message.content}</p></div>`;
  }

  static addMessagesHistory(messages) {
    const messagesFormattedToHTML = messages.map(
      message =>
        `<div class="${message.owner == userName ? "own-message" : "message"}"><span>${
          message.owner
        }</span><p>${message.content}</p></div>`
    );

    messagesDivElement.innerHTML = messagesFormattedToHTML.join("");
  }

  static addTag(tagData) {
    messagesDivElement.innerHTML += `<span>${tagData.content}</span>`;
  }
}

const socket = Server.connect();
socket.onmessage = messageData => {
  const message = JSON.parse(messageData.data);

  if (message.type == "history") {
    MessagesListHTML.addMessagesHistory(message.messages);
    return;
  }

  if (message.type == "tag") {
    MessagesListHTML.addTag(message);
    return;
  }

  MessagesListHTML.add(message);
};

sendMessageButtonElement.onclick = () => {
  const message = messageInputElement.value;
  messageInputElement.value = "";

  const messageData = { content: message, owner: userName };

  socket.send(JSON.stringify(messageData));

  MessagesListHTML.add(messageData);
};

function getLocalIP(callback) {
  const rtcPeerConnection =
    window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  const pc = new rtcPeerConnection({ iceServers: [] });
  const noop = () => {};

  const localIPs = {};
  const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/g;
  const key = "candidate";

  function iterateIP(ip) {
    if (!localIPs[ip]) callback(ip);
    localIPs[ip] = true;
  }

  pc.createDataChannel("");
  pc.createOffer()
    .then(sdp => {
      sdp.sdp.split("\n").forEach(line => {
        if (line.indexOf(key) < 0) return;
        line.match(ipRegex).forEach(iterateIP);
      });

      pc.setLocalDescription(sdp, noop, noop);
    })
    .catch(reason => {
      console.log("Erro ao criar oferta SDP", reason);
    });

  pc.onicecandidate = function (ice) {
    if (!ice || !ice.candidate || !ice.candidate.candidate) return;
    ice.candidate.candidate.match(ipRegex).forEach(iterateIP);
  };
}
