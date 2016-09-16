
var map = new Object();
var express = require('express');

var fs = require('fs');

var mkdirp = require('mkdirp');
var clients = [];
var options = {
    secret: "a secret key for session",
}

var app = require("sockpress").init(options);
app.listen(9091, '192.168.1.5');
var email;

app.use("/",express.static(__dirname + '/static'));


app.get('/home', function (req, res) {
  //res.send({authenticated: true});
  req.session.authenticated = true;
  console.log(req.query.email);
   console.log(req.query.name);
  req.session.email = req.query.email;
  req.session.name = req.query.name;
  req.session.save();
  res.sendfile(__dirname +'/home.html');
});
/* app.get('/pencil010.png', function(req, res){
 res.sendfile('pencil010.png');
}); */

/* var transporter = nodemailer.createTransport({
    service: 'Yahoo',
    auth: {
        user: 'alokpathak@rocketmail.com',
        pass: 'Pa55word@87'
    }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: 'Alok Pathak <alokpathak@rocketmail.com>', // sender address
    to: 'alok baba <alokpathak@rocketmail.com>', // list of receivers
    subject: 'Hello Baba', // Subject line
    text: 'Hello world ', // plaintext body
    html: '<b>Hello world âœ”</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
    }else{
        console.log('Message sent: ' + info.response);
    }
});
 */
 
app.io.on('connection', function(socket) {
console.log(socket.session.authenticated+'  session authentication..');
  
	
	socket.on('Message', function(msg){
		//console.log('message: ' + msg  +'  '+socket.id +'   '+ map);
		socket.emit('Message', socket.session.name+' : '+msg);
		socket.broadcast.emit('Message', socket.session.name+' : '+msg);
	
	});
	
	 socket.on('disconnect', function(){
	   var eml =socket.session.email;
	   clients.splice(elementMatchInMap(clients,eml), 1);
        console.log('user disconnected');
		socket.broadcast.emit('dis',eml);
     });
	 
	  socket.on('Register', function(email){
		var eml =socket.session.email;
		if(elementMatchInMap(clients,eml) > -1){
		   var toSocketId = map[eml];
		   socket.emit('Register',clients);
		   
		}else{
		   console.log("new users......");
		   var mapEmaiName = new Object();
		   mapEmaiName[eml] = socket.session.name
		   clients.push(mapEmaiName); 
		   map[socket.session.email]=socket.id;
		   socket.emit('Register',clients,null);
		   socket.broadcast.emit('Register',socket.session.email,socket.session.name);
		}
     });
	 
	 socket.on('privmsg', function(toEmailID, msg){
	 		
	  var toSocketId = map[toEmailID];
	  var myEmailID =socket.session.email;
	  var myName =socket.session.name;
	  createFileNPostChat(myEmailID,toEmailID,msg);
      socket.to(toSocketId).emit('privmsg', msg, myEmailID , myName);
     });
	 
   function elementMatchInMap(usersArr,emailId) {
	   for(var index in usersArr){
	   var map = elementMatchMap(usersArr[index], emailId);
	      if(map !=null){
		   return index;
	      }
		}
	}
	
   function elementMatchMap(map, emailid) {
		for (var mailId in map) {
			 if(mailId == emailid){
				return map;
			 }else{
			 return null;
			 }
		}
   }
 
 function createFileNPostChat(myEmailID,toEmailID,msg){
 
       console.log('Posting comment in file....');
	   
      if(isDirectoryExist(myEmailID,toEmailID)){
		  appendMsgToFile(myEmailID,toEmailID,msg); 
      }else if(isDirectoryExist(toEmailID,myEmailID)){
	      appendMsgToFile(toEmailID,myEmailID,msg); 
      }else{
		  createDirOfChatUser(myEmailID,toEmailID);
		  appendMsgToFile(myEmailID,toEmailID,msg); 
      } 
 }
 
	function isDirectoryExist(mailID,mailIDN){
		fs.exists('chathistroy/'+mailID+'+'+mailIDN+'', function (exists) {
			console.log(exists +' '+mailID);
		  return exists;
		});
	 
	 }

 
 function createDirOfChatUser(myEmailID,toEmailID){
    mkdirp('chathistroy/'+myEmailID+'+'+toEmailID+'', function(err) { 
    });
 }
 
 function appendMsgToFile(myEmailID,toEmailID,msg){
 
     fs.appendFile('chathistroy/'+myEmailID+'+'+toEmailID+'/'+new Date().getDate()+'-'+new Date().getMonth()+'-'+new Date().getFullYear()+'.txt', '%%$ '+msg+' %%$ '+new Date().getTime()+' \r\n', function (err) {
        if (err) throw err;
        console.log('It\'s saved! in same location.');
    });
 }
   
   
 });