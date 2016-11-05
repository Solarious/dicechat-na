var https = require('https');
var locks = require('locks');
var async = require('async');

var url = 'https://qrng.anu.edu.au/API/jsonI.php?type=uint16&length=100';
var R_MAX = 65535;
var rNumbers = [];
var mutex = locks.createMutex();

function div(a, b) {
	return Math.floor(a / b);
}

function getNewRandomNumbers(callback) {
	https.get(url, function(res) {
		if (res.statusCode !== 200)
			return callback('Request failed, status code was ' + res.statusCode);
		
		var rawData = '';
		res.on('error', function (err) {
			return callback(err);
		});

		res.on('data', function(chunk) {
			rawData += chunk;
		});

		res.on('end', function() {
			try {
				var body = JSON.parse(rawData);
			} catch (e) {
				callback(e.message);
			}
			if (!body.success)
				return callback('Error, body.success !== true');
			return callback(null, body.data);
		});
	});
}

function nextRand(callback) {
	mutex.lock(function() {
		if (rNumbers.length > 0) {
			var r = rNumbers.pop();
			mutex.unlock();
			return callback(null, r);
		}
		getNewRandomNumbers(function(err, data) {
			if (err) {
				mutex.unlock();
				callback(err);
			}
			rNumbers = data;
			var r = rNumbers.pop();
			mutex.unlock();
			return callback(null, r);
		});
	});
}

// return a random number in [0, max)
function getRand(range, callback) {
	return nextRand(function(err, n) {
		if (n >= (range * div(R_MAX+1, range)))
			return getRand(range, callback);
		if (err)
			return callback(err);
		return callback(null, n);
	});
}

// return a random number in [lower, upper]
function getRandRange(lower, upper, callback) {
	var range = upper - lower + 1;
	getRand(range, function(err, n) {
		if (err)
			return callback(err);
		return callback(null, div(n, div(R_MAX+1, range)) + lower);
	});
}

function f(value, lower, upper) {
	return function(callback) {
		if (value) {
			getRandRange(lower, upper, function(err, num) {
				callback(err, num);
			});
		} else {
			callback(null, 0);
		}
	};
}

function f(value, lower, upper) {
	return function(callback) {
		if (value) {
			async.times(value, function(i, next) {
				getRandRange(lower, upper, function(err, num) {
					next(err, num);
				});
			}, function(err, data) {
				callback(err, data);
			});
		} else {
			callback(null, 0);
		}
	};
}

function getDice(dice, callback) {
	async.parallel([
		f(dice.boost, 1, 6),
		f(dice.ability, 1, 8),
		f(dice.proficiency, 1, 12),
		f(dice.setback, 1, 6),
		f(dice.difficulty, 1, 8),
		f(dice.challenge, 1, 12),
		f(dice.force, 1, 12),
	], function(err, data) {
		if (err)
			return callback(err);
		callback(null, {
			boost: data[0],
			ability: data[1],
			proficiency: data[2],
			setback: data[3],
			difficulty: data[4],
			challenge: data[5],
			force: data[6]
		});
	});
}


module.exports = {
	getRandRange: getRandRange,
	getRand: getRand,
	nextRand: nextRand,
	getDice: getDice
};
