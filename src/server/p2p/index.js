const { io: SocketClient } = require("socket.io-client");

const bootstrap_peer = process.argv.length >= 3 ? process.argv[2].trim() : "";

/**
 *
 * @param {import("socket.io").Server} io
 */
function handleP2P(io) {
  const state = {
    peers: new Set(io.sockets.sockets.keys()),
  };

  if (bootstrap_peer) {
    const firstConnect = SocketClient(bootstrap_peer);
    firstConnect.on("open", () => {
      state.peers.add(bootstrap_peer);
      console.log("Connect peer " + bootstrap_peer);
    });
    firstConnect.on("disconnect", () => {
      state.peers.delete(bootstrap_peer);
    });
  }

  io.on("connection", (socket) => {
    const socketIp = socket.handshake.address.toString();
    state.peers.add(socketIp);
    console.log(`Peer ${socketIp} connect to`);

    socket.on("peers_request", (otherId) => {
      socket.to(otherId).emit("peers", Array.from(state.peers));
    });
    socket.on("peers", (otherId, peerIps) => {
      peerIps.forEach((peerIp) => {
        if (state.peers.has(peerIp)) return;
        const connectTo = SocketClient(peerIp);
        connectTo.on("open", () => {
          state.peers.add(peerIp);
          console.log("Connect peer " + peerIp);
        });
        connectTo.on("disconnect", () => {
          state.peers.delete(peerIp);
        });
      });
    });

    socket.on("disconnect", () => {
      state.peers.delete(socketIp);
    });
  });
}

module.exports = handleP2P;
