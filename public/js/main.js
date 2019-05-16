var ip = location.host;

var ws = new WebSocket('ws://'+ip);
var wsEvent = $(document);
var nbPlayers = 0;
var MAX_PLAYERS = 5;
var players = [];
var walls = [];

//fill players
for(var i = 0; i < MAX_PLAYERS; i++){
  players[i] = -1;
}

console.log(players);

ws.onmessage = function(e){

  var data = JSON.parse(e.data);

  //trigger EVENT 'data.event' from app.js (merci jquery)
  $(document).trigger(data.event, [data]);
}

//create Events...
wsEvent.on('goUp', function(e, data){
  console.log("goUp: "+data.idPlayer);

  players[data.idPlayer].speedY = -10;
  players[data.idPlayer].newPos();
});

wsEvent.on('goDown', function(e, data){
  console.log("goDown: "+data.idPlayer);

  players[data.idPlayer].speedY = 10;
  players[data.idPlayer].newPos();
});

wsEvent.on('stopMove', function(e, data){
  console.log("freeze: "+data.idPlayer);

  players[data.idPlayer].speedY = 0;
  players[data.idPlayer].newPos();
});

wsEvent.on('removePlayer', function(e, data){
  console.log('Remove player: '+data.idPlayer);

  players[data.idPlayer] = -1;
});

wsEvent.on('newPlayer', function(e, data){
  console.log(players);

  var newPlayer = new Component(
    data.player.size,
    data.player.size,
    data.player.x,
    data.player.y,
    "player",
    data.player.color,
    data.player.id
  );

  players[data.player.id] = newPlayer;
  newPlayer.update();
});


/* ------------------------------------------------------------------------- */

var cvs;
var ctx;
var gameInterval;
var isRunning = 0;
var tickWall = 0;
var wallWidth = 80;

$(document).ready(function(){

  cvs = document.getElementById("canvas");;
  ctx = cvs.getContext("2d");

  cvs.width = $(document).width();
  cvs.height = $(document).height();

  startGame();
});

function Component(width, height, x, y, type, color = "green", id = "wall"){
  this.type = type;
  this.id = id;
  this.color = color;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.update = function() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
  this.outOfScreen = function() {
    var cvsBottom = cvs.height - this.height;
    if(this.y > cvsBottom || this.y <= 0){
      //this.speedY = 0;                COLLISION TOP/BOTTOM
    }
  }
  this.collisionWith = function(otherobj) {
    var pleft = this.x;
    var pright = this.x + (this.width);
    var ptop = this.y;
    var pbottom = this.y + (this.height);
    var oleft = otherobj.x;
    var oright = otherobj.x + (otherobj.width);
    var otop = otherobj.y;
    var obottom = otherobj.y + (otherobj.height);
    var collision = true;
    if ((pbottom < otop) || (ptop > obottom) || (pright < oleft) || (pleft > oright)) {
      collision = false;
    }
    return collision;
  }
}

function createWall(){

  var heightTopWall = Math.floor(Math.random() * (cvs.height - 2*wallWidth)) + wallWidth;
  var heightBotWall = Math.floor(Math.random() * (cvs.height-heightTopWall-wallWidth)) + wallWidth;

  var newTopWall = new Component(
    wallWidth,        //width
    heightTopWall,    //height
    cvs.width,        //posX
    0                 //posY
  );

  var newBotWall = new Component(
    wallWidth,   //width
    heightBotWall,   //height
    cvs.width,      //posX
    cvs.height - heightBotWall       //posY
  );

  newTopWall.speedX = -8;
  newBotWall.speedX = -8;

  walls.push(newTopWall);
  walls.push(newBotWall);
}


function startGame(){
  isRunning = 1;
  gameInterval = setInterval(updateGameArea, 20);
}

$('.pause-btn').click(function(){

  if(isRunning){

    clearInterval(gameInterval);
    isRunning = 0;
    $(this).text('START');
  } else{

    gameInterval = setInterval(updateGameArea, 20);
    isRunning = 1;
    $(this).text('PAUSE');
  }
});

function updateGameArea(){

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  for(var i = 0; i < players.length; i++){
    if(players[i] != -1){
      players[i].newPos();
      players[i].update();
    }
  }

  for(var i = 0; i < walls.length; i++){
    walls[i].newPos();
    walls[i].update();
  }

  if(tickWall < 80){
    tickWall++;
  }else{
    createWall();
    tickWall = 0;
  }
}
