var io = require('socket.io');
var Chatroom = require('./models/chatroom');
var random = require('./random');

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
			if (!isAuthorized(socket.id)) {
				socket.emit('client-text',
				'You are not authorized to send messages. Please authenticate');
			} else {
				send(socket.id, 'client-text',
				socketInfo[socket.id].nickname + ': ' + msg);
			}
			
		});

		socket.on('server-dice', function(data) {
			if (!isAuthorized(socket.id)) {
				socket.emit('client-text',
				'You are not authorized to send dice rolls. Please authenticate');
			} else {
				console.log('got server-dice from authorized user');
				if (data == null)
					return;
				random.getDice(data, function(err, results) {
					if (err) {
						socket.emit('client-text', 'Error rolling dice');
					} else {
						send(socket.id, 'client-dice', {
							from: socketInfo[socket.id].nickname,
							results: results
						});
					}
				});
			}
		});
	});
};
