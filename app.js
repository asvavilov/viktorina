//EXPRESS_ENV=production|development node app.js

/**
 * Module dependencies.
 */

var express = require('express');
//var connect = require('connect');
var MemoryStore = require('connect/middleware/session/memory');

var mongoose = require('mongoose').Mongoose;
var db = mongoose.connect('mongodb://localhost/quiz');
require('./libs/user');
require('./libs/room');

mongoose.model('User', UserModel);
mongoose.model('Room', RoomModel);
var User = db.model('User');
var Room = db.model('Room');

var app = express.createServer();

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.use(express.bodyDecoder());
	app.use(express.methodOverride());
	app.use(express.compiler({ src: __dirname + '/public', enable: ['less', 'sass'] })); // less, sass
	app.use(express.cookieDecoder());
	app.use(express.session({ store: new MemoryStore({ reapInterval: 60000 * 10, maxAge: 60000 * 30 }) }));
	app.use(app.router);
	app.use(express.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
	app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
console.log(req.session)
	res.render('index.jade');
});

app.get('/room', function(req, res){
    res.render('room.jade', {
        locals: {
            title: 'Some room'
        }
    });
});

app.post('/login', function(req, res){
	if (req.body.token) {
		// http://loginza.ru/api/authinfo?token=[TOKEN_KEY_VALUE]
		var http = require('http');
		var loginza = http.createClient(80, 'loginza.ru');
		var request = loginza.request('GET', '/api/authinfo?token='+req.body.token, {'host': 'localhost'});
		request.end();
		request.on('response', function (response) {
		  //console.log('STATUS: ' + response.statusCode);
		  //console.log('HEADERS: ' + JSON.stringify(response.headers));
		  //response.setEncoding('utf8');
			response.on('data', function (chunk) {
			  //console.log('BODY: ' + chunk);
  //console.log(JSON.parse(chunk));
  // {"error_type":"token_validation","error_message":"Empty token value."}
				try {
					var res_json = JSON.parse(chunk);
				} catch (e) {
					// TODO !!! parse error
					res_json = {'error_type': 'JSON::Parse', 'error_message': 'Error parsing JSON'}
					//return ;
				}
				if (!res['error_type']) {
					User.find({'identity': res_json['identity']}).one(function(u){
						if (!u) {
							u = new User();
							u.identity = res_json['identity'];
							u.provider = res_json['provider'];
							u.save();
						}
						req.session['user'] = {'identity': u.identity, 'provider': u.provider};
						//console.log(u)
					});
				}
res.render('login.jade', {locals: {json: chunk}}); // temporary, after be redirect
			});
		});
	} else {
		// not found *token*
		res.render('login.jade');
	}
});

app.listen(3000);


// Other

var io = require('socket.io');
io = io.listen(app);
var
	buffer = [], 
	json = JSON.stringify;

//var sys = require('sys');
io.on('connection', function(client){
    //console.log(client);
    // ok!!!
    //...
	client.send(json({ buffer: buffer }));
	client.broadcast(json({ announcement: client.sessionId + ' connected' }));

	client.on('message', function(message){
		var msg = { message: [client.sessionId, message] };
		buffer.push(msg);
		if (buffer.length > 15) buffer.shift();
		client.broadcast(json(msg));
	});

	client.on('disconnect', function(){
		client.broadcast(json({ announcement: client.sessionId + ' disconnected' }));
	});
});

/*
setInterval(function(){
//	//console.log(io.clients)
}, 1000);
*/
