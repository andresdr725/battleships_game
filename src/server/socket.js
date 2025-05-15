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

  socket.on("createGame", ({ playerName, gameCode }) => {
    if (games[gameCode]) {
      socket.emit("error", { message: "El código de partida ya existe." });
      return;
    }

    socket.join(gameCode);
    games[gameCode] = {
      players: [{ id: socket.id, name: playerName }],
      boards: {},
      turn: null,
      shipsPlaced: 0,
    };

    socket.emit("gameCreated", { gameCode });
  });

  socket.on("joinGame", ({ playerName, gameCode }) => {
    if (!games[gameCode]) {
      socket.emit("error", { message: "Código de partida inválido." });
      return;
    }

    if (games[gameCode].players.length >= 2) {
      socket.emit("error", { message: "La partida está llena." });
      return;
    }

    socket.join(gameCode);
    const player = { id: socket.id, name: playerName };
    games[gameCode].players.push(player);

    socket.emit("joinedGame", { message: "Esperando al otro jugador..." });

    if (games[gameCode].players.length === 2) {
      const [player1, player2] = games[gameCode].players;
      games[gameCode].turn = player1.id;
      io.to(gameCode).emit("gameReady", {
        players: games[gameCode].players,
        yourTurn: player1.id === socket.id,
      });
    }
  });

  socket.on("placeShips", ({ gameCode, positions }) => {
    if (!games[gameCode] || !positions || positions.length !== 6) {
      socket.emit("error", { message: "Colocación de barcos inválida." });
      return;
    }

    games[gameCode].boards[socket.id] = { ships: positions, hits: [] };
    games[gameCode].shipsPlaced++;

    if (games[gameCode].shipsPlaced === 2) {
      io.to(gameCode).emit("shipsConfirmed");
      io.to(games[gameCode].turn).emit("fireResult", {
        yourTurn: true,
      });
    }
  });

  socket.on("fire", ({ gameCode, targetIndex }) => {
    if (!games[gameCode] || games[gameCode].turn !== socket.id) {
      socket.emit("error", { message: "No es tu turno." });
      return;
    }

    const opponent = games[gameCode].players.find((p) => p.id !== socket.id);
    const opponentBoard = games[gameCode].boards[opponent.id];

    if (!opponentBoard) {
      socket.emit("error", { message: "El oponente no ha colocado sus barcos." });
      return;
    }

    const isHit = opponentBoard.ships.includes(targetIndex);
    if (isHit) {
      opponentBoard.hits.push(targetIndex);
    }

    io.to(gameCode).emit("fireResult", {
      targetIndex,
      result: isHit ? "hit" : "miss",
      yourTurn: false,
    });

    io.to(opponent.id).emit("opponentFire", {
      targetIndex,
      result: isHit ? "hit" : "miss",
      yourTurn: true,
    });

    games[gameCode].turn = opponent.id;

    // Verificar si el oponente ha perdido
    if (opponentBoard.hits.length === opponentBoard.ships.length) {
      io.to(gameCode).emit("gameOver", { winner: games[gameCode].players.find((p) => p.id === socket.id).name });
      delete games[gameCode];
    }
  });

  socket.on("leaveGame", ({ gameCode }) => {
    if (games[gameCode]) {
      const opponent = games[gameCode].players.find((p) => p.id !== socket.id);
      if (opponent) {
        io.to(opponent.id).emit("gameOver", { winner: null });
      }
      delete games[gameCode];
    }
    socket.leave(gameCode);
  });

  socket.on("disconnect", () => {
    for (const gameCode in games) {
      const game = games[gameCode];
      const playerIndex = game.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        game.players.splice(playerIndex, 1);
        delete game.boards[socket.id];
        if (game.players.length === 0) {
          delete games[gameCode];
        } else {
          io.to(gameCode).emit("gameOver", { winner: null });
          delete games[gameCode];
        }
      }
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => console.log("Servidor Socket.IO en puerto 3000"));