var app = angular.module('MainCtrl', []);
app.controller('MainController', ['$scope', '$routeParams',
function($scope, $routeParams) {
	$scope.getChatroomName = function() {
		return $routeParams['chatroom_name'];
	};
}]);
