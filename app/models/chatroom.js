var mongoose = require('mongoose');
var Schema = mongoose.Schema;
// Use native ES6 promises
mongoose.Promose = global.Promise;
var bcrypt = require('bcrypt-nodejs');

var MessageSchema = new Schema({
	username: String,
	text: String,
});

var ChatroomSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	password: {
		type: String,
		required: true
	}
});

ChatroomSchema.pre('save', function(next) {
	var user = this;
	var SALT_FACTOR = 5;

	if (!user.isModified('password'))
		return next();
	
	bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
		if (err)
			return next(err);

		bcrypt.hash(user.password, salt, null, function(err, hash) {
			if (err)
				return next(err);
			user.password = hash;
			next();
		});
	});
});

ChatroomSchema.methods.verifyPassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if (err)
			return callback(err);
		callback(null, isMatch);
	});
};

module.exports = mongoose.model('Chatroom', ChatroomSchema);
