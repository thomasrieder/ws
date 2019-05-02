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





var remotes = [];
var displays = [];

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

    var REMOTE_ID = remotes.push(co) - 1;
  } else {

    var DISPLAY_ID = displays.push(co) - 1;
  }


  co.on('message', function(data){

    var arrByte = new Buffer.from(data.binaryData);
    checkOpcode(arrByte[0], REMOTE_ID);
  });

  co.on('close', function(ws){

    if(isRemote(req.origin)){
      console.log('Remove player:  ', REMOTE_ID);
      remotes.splice(REMOTE_ID, 1);
    } else {
      displays.splice(DISPLAY_ID, 1);
    }
  });
});

//data.event RESERVED
function broadcastToDisplay(ev, data){

  //add event to data
  data.event = ev;

  for(var i = 0; i < displays.length; i++){
    displays[i].send(JSON.stringify(data));
  }
}

function checkOpcode(opcode, idPlayer){

  console.log('OPT: ' + opcode);
  switch(opcode){
    case 170: //0xAA
      broadcastToDisplay("up", {idPlayer: idPlayer, pd: "t'es un fdp"}); //UP
      break;
    case 187: //0xBB
      broadcastToDisplay("down", {idPlayer: idPlayer, tam: "ta mère"}}); //DOWN
      break;
  }

  if(opcode == 170){

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
