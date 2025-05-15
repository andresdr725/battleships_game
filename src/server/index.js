import { Server } from "socket.io";
import http from "http";
import express from "express";
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

const games = {};

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("joinGame", ({ playerName, gameCode }) => {
    socket.join(gameCode);

    if (!games[gameCode]) {
      games[gameCode] = { players: [], boards: {}, turns: 0 };
    }

    const player = { id: socket.id, name: playerName };
    games[gameCode].players.push(player);

    socket.emit("joinedGame", { message: "Esperando al otro jugador..." });
    if (games[gameCode].players.length === 2) {
      io.to(gameCode).emit("gameReady", games[gameCode].players);
    }
  });

  socket.on("placeShips", ({ gameCode, positions }) => {
    games[gameCode].boards[socket.id] = { ships: positions, hits: [] };
  });

  socket.on("fire", ({ gameCode, targetIndex }) => {
    const opponent = games[gameCode].players.find((p) => p.id !== socket.id);
    const opponentBoard = games[gameCode].boards[opponent.id];

    const isHit = opponentBoard.ships.includes(targetIndex);
    if (isHit) {
      opponentBoard.hits.push(targetIndex);
    }

    io.to(gameCode).emit("fireResult", {
      from: socket.id,
      targetIndex,
      result: isHit ? "hit" : "miss",
    });
  });

  socket.on("disconnect", () => {
    for (const code in games) {
      games[code].players = games[code].players.filter(
        (p) => p.id !== socket.id
      );
      delete games[code].boards[socket.id];
    }
  });
});

server.listen(3000, () => console.log("Servidor Socket.IO en puerto 3000"));
