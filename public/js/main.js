var ip = location.host;

var ws = new WebSocket('ws://'+ip);
var wsEvent = $(document);
var nbPlayers = 0;
var players = [];

ws.onmessage = function(e){

  var data = JSON.parse(e.data);

  //trigger EVENT 'data.event' from app.js (merci jquery)
  $(document).trigger(data.event, [data]);
}

//create Events...
wsEvent.on('goUp', function(e, data){
  console.log("goUp: "+data.idPlayer);
  var player = getPlayer(data.idPlayer);
  player.speedY = -10;
});

wsEvent.on('goDown', function(e, data){
  console.log("goDown: "+data.idPlayer);
  var player = getPlayer(data.idPlayer);
  player.speedY = 10;
});

wsEvent.on('stopMove', function(e, data){
  console.log("freeze: "+data.idPlayer);
  var player = getPlayer(data.idPlayer);
  player.speedY = 0;
});

wsEvent.on('removePlayer', function(e, data){
  console.log('Remove player: '+data.idPlayer);

  for(var i = 0; i < players.length; i++){
    if(players[i].id == data.idPlayer){
      players.splice(i, 1);
    }
  }
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
  newPlayer.update();
  players.push(newPlayer);
});


var cvs;
var ctx;
var gameInterval;
$(document).ready(function(){

  cvs = document.getElementById("canvas");;
  ctx = cvs.getContext("2d");

  cvs.width = $(document).width();
  cvs.height = $(document).height();

  startGame();
});

function getPlayer(idPlayer){
  var found = players.find(function(el) {
    return el.id == idPlayer;
  });

  return found;
}

function Component(width, height, x, y, type, color = "green", id = "mur"){
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

function startGame(){
  gameInterval = setInterval(updateGameArea, 20);
}

function updateGameArea(){

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  for(var i = 0; i < players.length; i++){

    players[i].newPos();
    players[i].update();
  }
}
