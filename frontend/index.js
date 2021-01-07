const BG_COLOUR = '#231f20';
const SNAKE_COLOUR = '#3dffe8';
const SNAKE2_COLOUR = '#ff673d';
const FOOD_COLOUR = '#e66916';
var myMusic = new sound("back.mp3");
var victory = new sound("victory.mp3");
var apple = new sound("apple.wav");
var over = new sound("over.wav");
const socket = io('https://snekpvp.herokuapp.com');
socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const backGameBtn = document.getElementById('backGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
backGameBtn.addEventListener('click', reset);

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.height = canvas.width;

  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  firstPaintGame(initialGameState());
  //myMusic = new sound("back.mp3");
  myMusic.loop = true;
  victory.loop = true;
  if (typeof myMusic.loop == 'boolean')
{
  myMusic.loop = true;
}
else
{
  myMusic.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
if (typeof victory.loop == 'boolean')
{
  victory.loop = true;
}
else
{
  victory.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
}
  myMusic.play();
  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, SNAKE2_COLOUR);
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;
  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
  gameCodeDisplay.innerText = "Eres el jugador: "+playerNumber;
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    myMusic.stop();
    victory.play();
    
    gameCodeDisplay.innerText = ("Ganaste, Presiona (volver) para regresar a la pantalla principal.");
  } else {
    myMusic.stop();
    over.play();
    gameCodeDisplay.innerText = ("Perdiste, Presiona (volver) para regresar a la pantalla principal.");
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = "El codigo de tu juego es: " + gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Este no es un codigo valido')
}

function handleTooManyPlayers() {
  reset();
  alert('Este juego esta lleno');
}

function reset() {
  gameCodeDisplay.innerText = "Eres el jugador: ";
  victory.stop();
  myMusic.stop();
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}


function firstPaintGame(state) {
  ctx.fillStyle = BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;
  paintPlayer(state.players[0], size, SNAKE_COLOUR);
  paintPlayer(state.players[1], size, SNAKE2_COLOUR);
}


function initialGameState() {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},

      ],
    }, {
      pos: {
        x: 18,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 20, y: 10},
        {x: 19, y: 10},

      ],
    }],
    food: {},
    gridsize: 20,
  };
}

function sound(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}