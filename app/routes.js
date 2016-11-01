var path = require('path');
var Chatroom = require('./models/chatroom');


module.exports = function(app) {
	app.get('/api/chatrooms', function(req, res) {
		Chatroom.find({}, {name: 1}, function(err, chatrooms) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.setHeader('Cache-Control', 'no-cache');
				res.json(chatrooms);
			}
		});
	})

	app.post('/api/chatrooms', function(req, res) {
		var chatroom = new Chatroom();
		chatroom.name = req.body['name'];
		chatroom.password = req.body['password'];
		chatroom.save(function(err) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.json({ message: 'Chatroom created with name: ' + chatroom.name });
			}
		});
	});

	app.get('/api/chatrooms/:chatroom_name', function(req, res) {
		Chatroom.findOne({
			'name': req.params.chatroom_name
		}, {
			'name': 1
		},
		function(err, chatroom) {
			if (err) {
				res.status(500).send(err);
			} else {
				res.setHeader('Cache-Control', 'no-cache');
				res.json(chatroom);
			}
		});
	})

	app.delete('/api/chatrooms/:chatroom_name', function(req, res) {
		Chatroom.findOne({
			'name': req.params.chatroom_name
		}, function(err, chatroom) {
			if (err) {
				res.status(500).send(err);
			} else {
				chatroom.verifyPassword(req.body['password'],
				function(err, isMatch) {
					if (err) {
						res.status(500).send(err);
					} else {
						chatroom.remove(function(err){
							if (err)
								res.status(500).send(err);
							else
								res.json({
									message: 'Chatroom deleted: ' + req.params.chatroom_name
								});
						});
					}
				}); 
			}
		})
	})

	/*app.post('/api/chatrooms/:chatroom_name', function(req, res) {
		Chatroom.findOne({
			'name': req.params.chatroom_name
		}, function(err, chatroom) {
			if (err) {
				res.status(500).send(err);
			} else {
				var username = req.body['username'];
				//var dice = req.body['dice'];
				// handleDice()
				var message = {
					username: username,
					text: text
					//dice: dice
				}
				chatroom.messages.push(message);
				chatroom.save(function(err) {
					if (err) {
						res.status(500).send(err);
					} else {
						res.json({ message: 'Message added to chatroom' });
					}
				});
			}
		});
	});*/


	// route to handle all angular requests
	app.get('*', function(req, res) {
		res.sendFile(path.resolve(__dirname, '../public/index.html'));
	});
};
