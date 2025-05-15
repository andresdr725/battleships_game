import { ref, onMounted } from "vue";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export const playerName = ref("");
export const gameCode = ref("");
export const generatedCode = ref("");
export const joined = ref(false);
export const gameReady = ref(false);
export const message = ref("Ingresa tu nombre y código para comenzar");

export const playerBoard = ref(Array(100).fill(null));
export const enemyBoard = ref(Array(100).fill(null));
const enemyShips = [6, 7, 12, 45, 67, 89];

export function fire(index, boardType) {
  const boardRef = boardType === "player" ? playerBoard : enemyBoard;
  if (boardRef.value[index] !== null) return;

  if (boardType === "enemy" && enemyShips.includes(index)) {
    boardRef.value[index] = "hit";
    message.value = "¡Impacto en el enemigo!";
  } else {
    boardRef.value[index] = "miss";
    message.value = "Agua...";
  }
}

function generateGameCode(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*¿?!¡-_";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function createGame() {
  if (!playerName.value) {
    message.value = "Por favor, ingresa tu nombre.";
    return;
  }

  const code = generateGameCode(5);
  generatedCode.value = code;
  gameCode.value = code;

  console.log(`player_name: ${playerName.value}, code: ${code}`);

  socket.emit("createGame", {
    playerName: playerName.value === undefined ? playerName.value : "player 1",
    gameCode: code,
  });
}

export function joinGame() {
  if (!playerName.value || !gameCode.value) {
    message.value = "Nombre y código son obligatorios.";
    return;
  }

  socket.emit("joinGame", {
    playerName: playerName.value,
    gameCode: gameCode.value,
  });
}

onMounted(() => {
  socket.on("gameCreated", ({ gameCode: code }) => {
    message.value = `Partida creada con código ${code}`;
    joined.value = true;
  });

  socket.on("gameReady", ({ message: msg }) => {
    message.value = msg;
    gameReady.value = true;
    joined.value = true;
  });

  socket.on("error", (msg) => {
    message.value = msg;
  });
});

export default {
  playerName,
  gameCode,
  generatedCode,
  joined,
  gameReady,
  message,
  playerBoard,
  enemyBoard,
  fire,
  createGame,
  joinGame
}
