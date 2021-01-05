const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');
var lastkeyCode;
const state = {};
const clientRooms = {};

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    
    if (!roomName) {
      return;
    }
    try {
      /*if(keyCode != null){
        //up
        if(keyCode == 38 && lastkeyCode != 40){
          keyCode = parseInt(keyCode);
        }
        //down
        if(keyCode == 40 && lastkeyCode != 38){
          keyCode = parseInt(keyCode);
        }
        //left
        if(keyCode == 37 && lastkeyCode != 39 ){
          keyCode = parseInt(keyCode);
        }
        //right
        if(keyCode == 39 && lastkeyCode != 37){
          keyCode = parseInt(keyCode);
        //}
        lastkeyCode =keyCode;
      }*/
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }
    if(keyCode != null){
      //up
      if(keyCode == 38 && lastkeyCode != 40){
        const vel = getUpdatedVelocity(keyCode);
      }
      //down
      if(keyCode == 40 && lastkeyCode != 38){
        const vel = getUpdatedVelocity(keyCode);
      }
      //left
      if(keyCode == 37 && lastkeyCode != 39 ){
        const vel = getUpdatedVelocity(keyCode);
      }
      //right
      if(keyCode == 39 && lastkeyCode != 37){
        const vel = getUpdatedVelocity(keyCode);
      }
      lastkeyCode =keyCode;
    }
    //const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
