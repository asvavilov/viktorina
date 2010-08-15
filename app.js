
/**
 * Module dependencies.
 */

var express = require('express'),
    connect = require('connect');

var app = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(connect.bodyDecoder());
    app.use(connect.methodOverride());
    app.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
   app.use(connect.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
    res.render('index.jade', {
        locals: {
            title: 'Express'
        }
    });
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
