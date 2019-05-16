var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');
var path = require('path');

var port = 8080;

var server = http.createServer(function(request, response){

  var dirname = './public';
  var filePath = '.' + request.url;

  if (filePath == './') {
      filePath = dirname+'/pages/home.html';
  }

  var extname = String(path.extname(filePath)).toLowerCase();
  var mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.gif': 'image/gif',
      '.wav': 'audio/wav',
      '.mp4': 'video/mp4',
      '.woff': 'application/font-woff',
      '.ttf': 'application/font-ttf',
      '.eot': 'application/vnd.ms-fontobject',
      '.otf': 'application/font-otf',
      '.svg': 'application/image/svg+xml'
  };

  var contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT') {
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end();
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      }
  });

}).listen(port);

wsServer = new WebSocketServer({
  httpServer: server
});



var MAX_PLAYERS = 5;
var remotes = [];
var players = [];
var displays = [];

//fill players
for(var i = 0; i < MAX_PLAYERS; i++){
  players[i] = -1;
}

wsServer.on('request', function(req){

  console.log("new connection");

  //check origin
  if(!originIsAllowed(req.origin)){
    req.reject();
    console.log(' Connection from origin ' + req.origin + ' rejected.');
    return;
  }
  console.log('Connections accepted with origin: '+ req.origin );

  var co = req.accept(null, req.origin);

  //push in array
  if(isRemote(req.origin)){

    //récupère un ID libre
    var PLAYER_ID = getFreeId();
    if(PLAYER_ID != -1){
      remotes[PLAYER_ID] = co;
      newPlayer(PLAYER_ID);
    }
  } else {

    var DISPLAY_ID = displays.push(co) - 1;
  }


  co.on('message', function(data){

    var arrByte = new Buffer.from(data.binaryData);
    checkOpcode(arrByte[0], PLAYER_ID, arrByte[2]);
  });

  co.on('close', function(ws){

    if(isRemote(req.origin)){
      console.log('Remove player:  ', PLAYER_ID);

      players[PLAYER_ID] = -1;
      broadcastToDisplay('removePlayer', {idPlayer: PLAYER_ID});
    } else {
      displays.splice(DISPLAY_ID, 1);
    }
  });
});

function getFreeId(){
  for(var i = 0; i < MAX_PLAYERS; i++){
    if(players[i] == -1){
      return i;
    }
  }
  return -1;
}

function newPlayer(idPlayer){

  var randomColor = "#000000".replace(/0/g, function(){
    return (~~(Math.random()*16)).toString(16);
  });

  var defX = 200;
  var defY = 0;

  var Player = {
    id: idPlayer,
    color: randomColor,
    x: defX,
    y: defY,
    size: 80
  };

  players[idPlayer] = Player;
  broadcastToDisplay('newPlayer', {player: Player});
  var msg = Buffer(randomColor);
  remotes[idPlayer].send(msg);
}

//data.event RESERVED
function broadcastToDisplay(ev, data){

  //add event to data
  data.event = ev;

  for(var i = 0; i < displays.length; i++){
    displays[i].send(JSON.stringify(data));
  }
}

function checkOpcode(opcode, idPlayer, data){

  console.log('OPT: ' + opcode);
  switch(opcode){
    case 0xaa: //0xAA
      if(data == 1){
        broadcastToDisplay("goUp", {idPlayer: idPlayer}); //GOUP
      }else{
        broadcastToDisplay("stopMove", {idPlayer: idPlayer});
      }

      break;
    case 0xbb: //0xBB
      if(data == 1){
        broadcastToDisplay("goDown", {idPlayer: idPlayer}); //GODOWN
      }else{
        broadcastToDisplay("stopMove", {idPlayer: idPlayer});
      }
      break;
  }
}

function isRemote(og){
  if(og == 'fdp'){
    return true;
  }
}

function originIsAllowed(og) {
  if(og == 'fdp'){
    return true;
  } else {
    return true; //TODO false
  }
}
