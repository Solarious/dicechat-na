angular.module('MessageService', [])
.factory('Messages', function() {
return {
diceToMsg: function(diceData, from) {
	var msg = {
		dice: [],
		results: []
	};
	var urlbase = 'https://s3-ap-southeast-2.amazonaws.com/dicechatassets/';
	var results = {
		success: 0,
		advantage: 0,
		triumph: 0,
		failure: 0,
		threat: 0,
		despair: 0,
		force_black: 0,
		force_white: 0
	};

	function addToMsgDice(dicename, arrayofnames) {
		var dices = diceData[dicename];
		for (var i = 0; i < dices.length; i++) {
			var r = arrayofnames[dices[i]-1];
			msg.dice.push({
				src: urlbase + dicename + '_' + r + '.png',
				alt: dicename + '_' + r
			});
			if (dicename === 'boost' || dicename === 'ability' ||
			dicename === 'proficiency') {
				if (r === 's') {
					results.success += 1;
				} else if (r === 'ss') {
					results.success += 2
				} else if (r === 'a') {
					results.advantage += 1;
				} else if (r === 'aa') {
					results.advantage += 2;
				} else if (r === 'as') {
					results.advantage += 1;
					results.success += 1;
				} else if (r === 't') {
					results.triumph += 1;
				}
			}
			if (dicename === 'setback' || dicename === 'difficulty' ||
			dicename === 'challenge') {
				if (r === 'f') {
					results.failure += 1;
				} else if (r === 'ff') {
					results.failure += 2;
				} else if (r === 't') {
					results.threat += 1;
				} else if (r === 'tt') {
					results.threat += 2;
				} else if (r === 'tf') {
					results.threat += 1;
					results.failure += 1;
				} else if (r === 'd') {
					results.despair += 1;
				}
			}
			if (dicename === 'force') {
				if (r === 'b') {
					results.force_black += 1;
				} else if (r === 'bb') {
					results.force_black += 2;
				} else if (r === 'w') {
					results.force_white += 1;
				} else if (r === 'ww') {
					results.force_white += 2;
				}
			}
		}
	}

	msg.type = 'dice';
	msg.from = from;

	addToMsgDice('boost', ['blank','blank','s','as','aa','a']);
	addToMsgDice('ability', ['blank','s','s','ss','a','a','as','aa']);
	addToMsgDice('proficiency', ['blank','s','s','ss','ss','a','as','as','as','aa','aa','t']);
	addToMsgDice('setback', ['blank','blank','f','f','t','t']);
	addToMsgDice('difficulty', ['blank','f','ff','t','t','t','tt','tf']);
	addToMsgDice('challenge', ['blank','f','f','ff','ff','t','t','tf','tf','tt','tt','d']);
	addToMsgDice('force', ['b','b','b','b','b','b','bb','w','w','ww','ww','ww']);

	console.log(results);

	if (results.success > results.failure) {
		for (var i = 0; i < (results.success - results.failure); i++) {
			msg.results.push({
				src: urlbase + 'success.png',
				alt: 'success'
			});
		}
	}
	if (results.success < results.failure) {
		for (var i = 0; i < (results.failure - results.success); i++) {
			msg.results.push({
				src: urlbase + 'failure.png',
				alt: 'failure'
			});
		}
	}
	if (results.advantage > results.threat) {
		for (var i = 0; i < (results.advantage - results.threat); i++) {
			msg.results.push({
				src: urlbase + 'advantage.png',
				alt: 'advantage'
			});
		}
	}
	if (results.advantage < results.threat) {
		for (var i = 0; i < (results.threat - results.advantage); i++) {
			msg.results.push({
				src: urlbase + 'threat.png',
				alt: 'threat'
			});
		}
	}
	for (var i = 0; i < results.triumph; i++) {
		msg.results.push({
			src: urlbase + 'triumph.png',
			alt: 'triumph'
		});
	}
	for (var i = 0; i < results.despair; i++) {
		msg.results.push({
			src: urlbase + 'despair.png',
			alt: 'despair'
		});
	}
	for (var i = 0; i < results.force_white; i++) {
		msg.results.push({
			src: urlbase + 'white.png',
			alt: 'white force'
		});
	}
	for (var i = 0; i < results.force_black; i++) {
		msg.results.push({
			src: urlbase + 'black.png',
			alt: 'black force'
		});
	}

	return msg;
}
};
});
