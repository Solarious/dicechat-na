var app = angular.module('ChatroomCtrl', []);
app.controller('ChatroomController', ['$scope', function($scope) {
	$scope.connect = function() {
		$scope.socket = io();
		$scope.addMsg('Connected');

		$scope.socket.on('client-text', function(text) {
			$scope.addMsg(text);
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
				text: text
			});
		});
	};

	$scope.$on('$locationChangeStart', function(event) {
		$scope.socket.disconnect();
	});

	$scope.msgs = [];
	$scope.connect();
}]);
