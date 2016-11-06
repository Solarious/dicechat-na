var io = require('socket.io');
var Chatroom = require('./models/chatroom');
var random = require('./random');

module.exports = function(http) {
	var io = require('socket.io')(http);

	var socketInfo = {};
	var roomInfo = {};

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

		var sendRoomInfo = function(roomName) {
			var info = { players: [] };
			if (roomInfo[roomName] !== undefined) {
				for (var i = 0; i < roomInfo[roomName].length; i++) {
					var id = roomInfo[roomName][i];
					info.players.push({
						nickname: socketInfo[id].nickname
					});
				}
			}
			io.sockets.in(roomName).emit('client-players', info);
		};

		var addToRoom = function(socket, roomName) {
			socket.join(roomName);
			if (roomInfo[roomName] === undefined)
				roomInfo[roomName] = [];
			if (roomInfo[roomName].indexOf(socket.id) === -1)
				roomInfo[roomName].push(socket.id);
			sendRoomInfo(roomName);
		};

		var removeFromRoom = function(socket) {
			if (socket.id in socketInfo) {
				var roomName = socketInfo[socket.id].chatroom;
				var index = roomInfo[roomName].indexOf(socket.id);
				roomInfo[roomName].splice(index, 1);
				sendRoomInfo(roomName);
			}
		}

		socket.on('disconnect', function() {
			if (socket.id in socketInfo) {
				send(socket.id, 'client-text',
				socketInfo[socket.id].nickname + ' has disconnected');
			}
			removeFromRoom(socket);
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
						addToRoom(socket, data.chatroomName);
						send(socket.id, 'client-text', nkn + ' has joined');
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
