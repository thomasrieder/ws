var ip = location.host;

var ws = new WebSocket('ws://'+ip);
var wsEvent = $(document);
var nbPlayers = 0;


ws.onmessage = function(e){

  var data = JSON.parse(e.data);

  //trigger EVENT 'data.event' from app.js (merci jquery)
  $(document).trigger(data.event, [data]);


  var id = data.idPlayer;

  if(id >= nbPlayers){
    createPlayer(id);
    nbPlayers++;
  } else{
    changePlayerColor(id)
  }
}

//create Events...
wsEvent.on('up', function(e, data){
  console.log(data);
});

wsEvent.on('down', function(e, data){
  console.log(data);
});

function createPlayer(id){
  var r = Math.floor(Math.random() * 255) + 1;
  var g = Math.floor(Math.random() * 255) + 1;
  var b = Math.floor(Math.random() * 255) + 1;
  $('.game').append('<div class="ply player-'+id+'" style="background-color: rgb('+r+', '+g+', '+b+');"></div>');
}

function changePlayerColor(id){
  var r = Math.floor(Math.random() * 255) + 1;
  var g = Math.floor(Math.random() * 255) + 1;
  var b = Math.floor(Math.random() * 255) + 1;
  $('.player-'+id).css('background-color', 'rgb('+r+','+g+','+b+')');
}
