var io = require('socket.io');
var Chatroom = require('./models/chatroom');

module.exports = function(http) {
	var io = require('socket.io')(http);

	var socketInfo = {};

	io.on('connection', function(socket) {
		console.log('a user connected');

		var isAuthorized = function(socketId) {
			return (socketId in socketInfo);
		};

		var send = function(socketId, type, data) {
			io.sockets.in(socketInfo[socketId].chatroom).emit(type, data);
		};

		var sendIfAuth = function(socketId, type, data) {
			if (isAuthorized(socketId))
				send(socketId, type, data);
		};

		socket.on('disconnect', function() {
			console.log('a user disconnected');
		});

		socket.on('auth', function(data) {
			console.log('auth attempt to ' + data.chatroomName +
			' with nickname ' + data.nickname);

			Chatroom.findOne({
				name: data.chatroomName
			}, function(err, chatroom) {
				if (err) {
					socket.emit('client-text',
					'Authorization denied: error finding chatroom');
				}
				if (!chatroom) {
					socket.emit('msg-to-client-txt',
					'Authorization denied: no chatroom with name ' + data.chatroomName);
				}
				chatroom.verifyPassword(data.password, function(err, isMatch) {
					if (isMatch) {
						var nkn = data.nickname || "Nr Noname";
						socketInfo[socket.id] = {
							nickname: nkn,
							chatroom: data.chatroomName
						};
						socket.join(data.chatroomName);
						socket.emit('client-text', 'Welcome ' + nkn);
					} else {
						socket.emit('client-text',
						'Authorization denied: invalid password');
					}
				});
			});
		});

		socket.on('server-text', function(msg) {
			console.log('Message:')
			console.log('\tmessage: ' + msg);
			console.log('\tsocket id: ' + socket.id);
			if (isAuthorized(socket.id)) {
				console.log('sending:');
				console.log('\tid: ' + socket.id);
				console.log('\tnickname: ' + socketInfo[socket.id].nickname);
				console.log('\tmsg: ' + msg);
				send(socket.id, 'client-text',
				socketInfo[socket.id].nickname + ': ' + msg);
			}
		});
	});
};
