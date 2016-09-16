var express = require('express');
var cookieParser = require('cookie-parser')();
var session = require('cookie-session')({ secret: 'secret' });
var router = express.Router();
var bodyParser = require('body-parser')
var fs = require('fs');
var mkdirp = require('mkdirp');
var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var multer  = require('multer');
var Schema = mongoose.Schema;


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
		console.log(file)
    cb(null,Date.now()+'-'+file.originalname)
  }
})

var options = {
	secret : "a secret key for session",
}
//var app = require("sockpress").init(options);
var app = express();
var passport = require('passport'),
FacebookStrategy = require('passport-facebook').Strategy;



app.set('env', 'dev');
if ('dev' == app.get('env')) {
	app.use("/", express.static(__dirname + '/staticscientist'));
	app.use(session);
	app.use(cookieParser);
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(router);
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(bodyParser.json());
	app.use(multer({ storage: storage }).single('photo'));
}
var http = require('http').Server(app);
var io = require('socket.io')(http);
http.listen(8081, '192.168.1.5');


console.log("In Main Scientist.. loading all modules...");

require('./staticscientist/routes/routes.js')(app);
var loadDBAndAllModels = require('./staticscientist/mongoose-db/loadAllModel.js');
loadDBAndAllModels.loadDBConnAndModels();

require('./staticscientist/mongoose-db/loadAllDaoUrlMappings.js')(app);

console.log("In Main Scientist.. all modules loaded successfully !!");

//authentication--> start

var passport = require('passport'), FacebookStrategy = require('passport-facebook').Strategy;
passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

var UserObj = {
	name : '',
	email : '',
	pwd : '',
	photourl : '',
	tagfollow : []
};

passport.use(new FacebookStrategy({
		clientID : 1513443402281467,
		clientSecret : '989ccdb169ed36a92a148320e0dcf16a',
		callbackURL : "http://www.frnzgroup.in:8081/auth/facebook/callback",
		profileFields : ['id', 'displayName', 'emails', 'photos']
	},
		function (accessToken, refreshToken, profile, done) {

		console.log(profile.id);
		console.log(profile.displayName);
		console.log(profile.photos[0].value);
		console.log(profile.emails[0].value);

		UserObj.name = profile.displayName,
		UserObj.email = profile.emails[0].value,
		UserObj.pwd = '',
		UserObj.photourl = '',
		UserObj.tagfollow = [],
		UserObj.notification = []

		//pass  UserObj to check value in db ifUserNotExistInsertNode

		var userValid = require('./staticscientist/mongoose-db/DaoImpl/UserDaoValidationImpl.js');
/* 		var tagDaoImpl = require('./staticscientist/mongoose-db/DaoImpl/TagDaoImpl.js');
		tagDaoImpl.removeAllTagFromElasticSrch({},function (err, msg) {
			console.log("tag removed..." + msg);
		}); */
		userValid.ifUserNotExistInsertNode(UserObj, function (err, user) {

			console.log("calling done..." + user);
			if (user) {
				user.photourl = profile.photos[0].value;
				user.name = profile.displayName;
				console.log("calling done..." + user.tagfollow);
				return done(null, user);
			} else
				return done(null, false, {
					message : 'Incorrect password.'
				});
		});

	}));

app.get('/auth/facebook', passport.authenticate('facebook', {
		scope : ['email']
	}));
	
	
	

app.get('/auth/facebook/callback',
	passport.authenticate('facebook', {
		successRedirect : '/test.do',
		failureRedirect : '/error.html'
	}));
	
	app.get('/', function (req, res) {
	
			console.log("home page after logout");
		
		res.sendFile(__dirname +'/staticscientist/login.html');
		//	res.redirect('/login.html');
	});

/* app.get('/test.do', loggedIn, function (req, res, next) {
//req.session.authenticated = true;
	res.redirect('/test.html');
}); */

/* app.get('/test1.html', loggedIn, function (req, res, next) {
//req.session.authenticated = true;
	res.sendFile(__dirname +'/staticscientist/test1.html');
}); */

/* app.post('/notifyme', loggedIn, function (req, res, next) {
//req.session.authenticated = true;

console.log("in notify.....server");
	res.send("jai hooo");
}); */


/* app.get('/getUserData.do', loggedIn, function (req, res, next) {
	console.log("inside get user data");
	res.json({
		userData : req.user
	});
}); */




/* app.get('/tag/*', function (req, res, next) {
	
	console.log("rot....");

	var filename = req.originalUrl.substring(req.originalUrl.lastIndexOf('/')+1);
	
	
	console.log(filename+"  filename");
 //   res.sendFile(__dirname +'/staticscientist/TagPage.html');
}); */




app.post('/api/photos',function(req, res) {


 
    // Everything went fine
	console.log(req.file.filename +" gottttttt "+ req.originalUrl);

	 res.send("<img id='upldImgtag' src='http://192.168.1.5:8081/uploads/"+req.file.filename+"' height='134px'  width='162px' />");
});



app.get('/uploads/*',function(req, res) {

console.log(__dirname+req.originalUrl);
 res.sendFile(__dirname+req.originalUrl);  
});

app.get('/searchtag', function(req, res){

  console.log("in searchtag")
  res.redirect('/');
  
});


app.get('/logout.do', function(req, res){

  console.log("in logout")
  req.logout();
  res.redirect('/');
  
});



function loggedIn(req, res, next) {
console.log("YES user request is there log in  "+req.user)
	if (req.user) {
		console.log("YES user request is there !!!!" + req.user.displayName);
		next();
	} else {
	 req.logout();
		res.redirect('/');
	}
}

//authentication--> end


//socket mechanism --> start
/* 
io.use(function(socket, next) {
    var req = socket.handshake;
    var res = {};
    cookieParser(req, res, function(err) {
        if (err) return next(err);
        session(req, res, next);
    });
});

 io.on('connection', function(socket){
  console.log('a user connected......................socket....................................');
  console.log(socket.handshake.session.authenticated+'  session authentication..');
}); 
 */


//socket mechanism --> end