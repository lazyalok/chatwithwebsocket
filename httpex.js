var map = {};
var sess;
var app = require('express')();

var session = require('express-session')
app.use(session({secret: 'ssshhhhh'}));
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
 res.sendfile('index.html');
});


app.get('/home', function (req, res) {
console.log('in home url ')
var email =req.query.email;
sess=req.session;

if(!sess.email){
sess.email =email;
}

  res.sendfile('home.html');
});

io.on('connection', function(socket){
  console.log('a user connected');
  
  
  //map[socket.id] = email;
  
	socket.on('Message', function(msg){
		console.log('message: ' + msg  +'  '+socket.id);
		 io.emit('Message', msg);
	});
	
	 socket.on('disconnect', function(){
        console.log('user disconnected');
     });
	 
	  socket.on('Register', function(email){
		putInMap(socket.id, email);
		io.emit('Register',  ' : is online ');
     });
  
  socket.on("privmessage", function(data){
	var to = map[data.id];
	io.sockets.socket(to).emit(data.msg);
  });
	 
});


http.listen(1337, function(){
  console.log('listening on :1337');
});

function putInMap(key, value){
map[key] = value;
} 


function getMapVal(key){
	return map[key];
}

function remove(key){
  delete  map[key];
}

function getMap() {
    return map;
}


