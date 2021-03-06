// 1) одна комната, вопрос - ответы, ответивший правильно
// ...
// подсказки
// много комнат
// статистика для пользователей
// командные игры
// ? тематические комнаты (если найду тематические вопросы)

//EXPRESS_ENV=production|development node app.js

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io');
var mongoose = require('mongoose');
//var json = JSON.stringify;
var path = require('path'); // модуль для парсинга пути


app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, "public"))); // запуск статического файлового сервера, который смотрит на папку public/ (в нашем случае отдает index.html)

/*
app.configure('development', function(){
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.errorHandler());
});
*/


//var Schema = mongoose.Schema;
var db = mongoose.connect('mongodb://localhost/quiz');
require('./libs/user');
require('./libs/room');

mongoose.model('User', UserSchema);
mongoose.model('Room', RoomSchema);

var User = db.model('User');
var Room = db.model('Room');


// Routes

app.get('/', function(req, res){
//console.log(req.session)
	res.render('index', {'locals': {'host': req.headers.host}});
});

app.get('/room/:room?', function(req, res){
	// TODO rooms from database
	//var room = ...
	if (!req.params.room) {
		res.render('rooms', {'locals': {'rooms': Room.find().all()}});
	} else {
		Room.findOne({'label': req.params.room}, function(err, r){

// FIXME временно
r = function(){this.title=req.params.room;};
r = new r();

			res.render('room', {
				locals: {
					room: r
				}
			});
		});
	}
});

app.post('/login', function(req, res){
  if (req.body.token) {
    // http://loginza.ru/api/authinfo?token=[TOKEN_KEY_VALUE]
    var http = require('http');
    var loginza = http.createClient(80, 'loginza.ru');
    var request = loginza.request('GET', '/api/authinfo?token='+req.body.token, {'host': 'yasla.net'});
    request.end();
    request.on('response', function(response){
      //console.log('STATUS: ' + response.statusCode);
      //console.log('HEADERS: ' + JSON.stringify(response.headers));
      //response.setEncoding('utf8');
      response.on('data', function(chunk){
        // {"error_type":"token_validation","error_message":"Empty token value."}
        var res_json;
        try {
          res_json = JSON.parse(chunk);
        } catch (e) {
          // TODO parse error
          res_json = {'error_type': 'JSON::Parse', 'error_message': 'Error parsing JSON'};
          //return ;
        }
        if (!res_json['error_type']) {
          User.findOne({'identity': res_json['identity']}, function(err, u){
            if (!u) {
              u = new User();
              u.identity = res_json['identity'];
              u.provider = res_json['provider'];
              u.save();
            }
            req.session['user'] = {
              'identity': u.identity,
              'provider': u.provider,
              'login_at': new Date()
            };
            res.redirect('/room');
          });
        } else {
          res.render('login');
        }
      });
    });
  } else {
    // not found *token*
    res.render('login');
  }
});

// Start app

app.listen(3000, function(){
    console.log('Express server listening on port 3000');
});

// Socket.IO

var buffer = [];

io = io.listen(server);
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
//  //console.log(io.clients)
}, 1000);
*/
