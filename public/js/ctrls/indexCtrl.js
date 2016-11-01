var app = angular.module('IndexCtrl', []);
app.controller('IndexController', ['$scope', 'Chatrooms', function($scope, Chatrooms) {
	$scope.testMessage = "Working!";

	$scope.addAlert = function(msg, type) {
		if (!$scope.alerts)
			$scope.alerts = [];
		$scope.alerts.push({
			msg: msg,
			type: type
		});
	};

	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.getChatrooms = function() {
		Chatrooms.get()
		.then(function(res) {
			$scope.chatrooms = res.data;
		}, function(res) {
			$scope.addAlert("Failed to get chatroom list from server");
		});
	};

	$scope.createChatroom = function() {
		if ($scope.newChatroomName != null) {
			Chatrooms.create($scope.newChatroomName, $scope.newChatroomPassword)
			.then(function(res) {
				$scope.newChatroomName = "";
				$scope.newChatroomPassword = "";
				$scope.getChatrooms();
			}, function(res) {
				$scope.addAlert("Failed to create chatroom");
			});
		}
	};

	$scope.getChatrooms();
}]);
