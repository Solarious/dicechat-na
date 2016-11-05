var app = angular.module('ChatroomCtrl', []);
app.controller('ChatroomController', ['$scope', 'Messages',
function($scope, Messages) {
	$scope.connect = function() {
		$scope.socket = io();
		$scope.addMsg('Connected');

		$scope.socket.on('client-text', function(text) {
			$scope.addMsg(text);
		});

		$scope.socket.on('client-dice', function(data) {
			$scope.addDiceMsg(data);
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

	$scope.addDiceMsg = function(diceData) {
		$scope.$evalAsync(function() {
			$scope.msgs.push(Messages.diceToMsg(diceData));
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

	$scope.sendDice = function() {
		$scope.socket.emit('server-dice', $scope.dice);
	};

	$scope.$on('$locationChangeStart', function(event) {
		$scope.socket.disconnect();
	});

	$scope.msgs = [];
	$scope.connect();
}]);
