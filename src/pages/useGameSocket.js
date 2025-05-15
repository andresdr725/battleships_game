import { io } from "socket.io-client";
import { onMounted, onUnmounted } from "vue";
import { nanoid } from "nanoid";

export function useGameSocket({
  playerName,
  gameCode,
  generatedCode,
  joined,
  gameReady,
  shipsPlaced,
  shipCount,
  isMyTurn,
  message,
  playerBoard,
  enemyBoard,
}) {
  const socket = io("http://localhost:3000", {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  // Crear una nueva partida
  const createGame = () => {
    if (!playerName.value.trim()) {
      message.value = "Por favor, ingresa un nombre válido.";
      return;
    }

    const code = nanoid(5);
    generatedCode.value = code;
    gameCode.value = code;

    socket.emit("createGame", {
      playerName: playerName.value,
      gameCode: code,
    });
  };

  // Unirse a una partida existente
  const joinGame = () => {
    if (!playerName.value.trim() || !gameCode.value.trim()) {
      message.value = "Nombre y código son obligatorios.";
      return;
    }

    socket.emit("joinGame", {
      playerName: playerName.value,
      gameCode: gameCode.value,
    });
  };

  // Colocar un barco en el tablero
  const placeShip = (index) => {
    if (playerBoard.value[index] === null && shipCount.value < 6) {
      playerBoard.value[index] = "ship";
      shipCount.value++;
    } else if (playerBoard.value[index] === "ship") {
      playerBoard.value[index] = null;
      shipCount.value--;
    }
  };

  // Confirmar la colocación de barcos
  const confirmShips = () => {
    if (shipCount.value !== 6) {
      message.value = "Debes colocar exactamente 6 barcos.";
      return;
    }

    const shipPositions = playerBoard.value
      .map((cell, index) => (cell === "ship" ? index : null))
      .filter((index) => index !== null);

    socket.emit("placeShips", {
      gameCode: gameCode.value,
      positions: shipPositions,
    });
    shipsPlaced.value = true;
  };

  // Disparar al tablero enemigo
  const fire = (index) => {
    if (!isMyTurn.value || enemyBoard.value[index] !== null) return;

    socket.emit("fire", {
      gameCode: gameCode.value,
      targetIndex: index,
    });
  };

  // Salir de la partida
  const leaveGame = () => {
    socket.emit("leaveGame", { gameCode: gameCode.value });
    resetState();
  };

  // Restablecer el estado del juego
  const resetState = () => {
    playerName.value = "";
    gameCode.value = "";
    generatedCode.value = "";
    joined.value = false;
    gameReady.value = false;
    shipsPlaced.value = false;
    shipCount.value = 0;
    isMyTurn.value = false;
    message.value = "Ingresa tu nombre y código para comenzar";
    playerBoard.value = Array(100).fill(null);
    enemyBoard.value = Array(100).fill(null);
  };

  // Configurar eventos del socket
  onMounted(() => {
    socket.on("connect", () => {
      message.value = "Conectado al servidor.";
    });

    socket.on("gameCreated", ({ gameCode }) => {
      message.value = `Partida creada con código ${gameCode}`;
      joined.value = true;
      gameReady.value = true;
    });

    socket.on("joinedGame", ({ message: msg }) => {
      message.value = msg;
      joined.value = true;
      gameReady.value = true;
    });

    socket.on("gameReady", ({ players, yourTurn }) => {
      message.value = "¡Juego listo! Coloca tus barcos.";
      isMyTurn.value = yourTurn;
    });

    socket.on("shipsConfirmed", () => {
      message.value = isMyTurn.value
        ? "¡Tu turno! Dispara al tablero enemigo."
        : "Esperando el turno del oponente...";
    });

    socket.on("fireResult", ({ targetIndex, result, yourTurn }) => {
      enemyBoard.value[targetIndex] = result;
      isMyTurn.value = yourTurn;
      message.value = result === "hit" ? "¡Impacto!" : "Agua...";
      if (!yourTurn) {
        message.value += " Esperando el turno del oponente...";
      }
    });

    socket.on("opponentFire", ({ targetIndex, result, yourTurn }) => {
      playerBoard.value[targetIndex] = result;
      isMyTurn.value = yourTurn;
      message.value = result === "hit" ? "¡Te han dado!" : "El enemigo falló.";
      if (yourTurn) {
        message.value += " ¡Tu turno!";
      }
    });

    socket.on("gameOver", ({ winner }) => {
      message.value = winner
        ? `¡${winner} ha ganado!`
        : "El juego terminó.";
      isMyTurn.value = false;
      setTimeout(resetState, 3000);
    });

    socket.on("error", ({ message: msg }) => {
      message.value = msg;
    });

    socket.on("disconnect", () => {
      message.value = "Desconectado del servidor. Intentando reconectar...";
    });
  });

  // Limpiar eventos al desmontar el componente
  onUnmounted(() => {
    socket.off("connect");
    socket.off("gameCreated");
    socket.off("joinedGame");
    socket.off("gameReady");
    socket.off("shipsConfirmed");
    socket.off("fireResult");
    socket.off("opponentFire");
    socket.off("gameOver");
    socket.off("error");
    socket.off("disconnect");
    socket.disconnect();
  });

  return {
    createGame,
    joinGame,
    placeShip,
    confirmShips,
    fire,
    leaveGame,
  };
}