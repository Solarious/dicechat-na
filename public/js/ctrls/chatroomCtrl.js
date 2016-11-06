var app = angular.module('ChatroomCtrl', []);
app.controller('ChatroomController', ['$scope', 'Messages',
function($scope, Messages) {
	$scope.connect = function() {
		$scope.socket = io();
		$scope.addMsg('Connected, please authenticate');

		$scope.socket.on('client-text', function(text) {
			$scope.addMsg(text);
		});

		$scope.socket.on('client-dice', function(data) {
			$scope.addDiceMsg(data.results, data.from);
		});

		$scope.socket.on('client-players', function(data) {
			console.log(data);
			$scope.players = data.players;
		});

		$scope.socket.on('disconnect', function() {
			$scope.addMsg('Disconnected');
		});
		$scope.socket.on('reconnect', function() {
			$scope.addMsg('Reconnected, please authenticate');
		});
	};

	$scope.auth = function() {
		$scope.socket.emit('auth', {
			nickname: $scope.nickname,
			chatroomName: $scope.getChatroomName(),
			password: $scope.password
		});
	};

	$scope.sendMsg = function() {
		console.log('sending message: ' + $scope.msgText);
		$scope.socket.emit('server-text', $scope.msgText);
		$scope.msgText = "";
	};

	$scope.addMsg = function(text) {
		$scope.$evalAsync(function() {
			$scope.msgs.push({
				type: 'text',
				text: text
			});
		});
	};

	$scope.addDiceMsg = function(diceData, from) {
		$scope.$evalAsync(function() {
			$scope.msgs.push(Messages.diceToMsg(diceData, from));
		});
	};

	$scope.resetDice = function() {
		$scope.dice.boost = undefined;
		$scope.dice.ability = undefined;
		$scope.dice.proficiency = undefined;
		$scope.dice.setback = undefined;
		$scope.dice.difficulty = undefined;
		$scope.dice.challenge = undefined
		$scope.dice.force = undefined;
	};

	$scope.incrementDice = function(dicename) {
		if ($scope.dice[dicename] === undefined)
			$scope.dice[dicename] = 1;
		else
			$scope.dice[dicename]++;
	};

	$scope.sendDice = function() {
		$scope.socket.emit('server-dice', $scope.dice);
	};

	$scope.$on('$locationChangeStart', function(event) {
		$scope.socket.disconnect();
	});

	$scope.msgs = [];
	$scope.diceNames = [
		'boost',
		'ability',
		'proficiency',
		'setback',
		'difficulty',
		'challenge',
		'force'
	];
	$scope.dice = {};
	for (var i = 0; i < $scope.diceNames.length; i++) {
		$scope.dice[$scope.diceNames[i]] = undefined;
	}
	$scope.connect();
}]);
