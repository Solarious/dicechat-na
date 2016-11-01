angular.module('appRoutes', [])
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$routeProvider
	.when('/', {
		templateUrl: 'views/home.html',
		controller: 'IndexController'
	})
	.when('/:chatroom_name', {
		templateUrl: 'views/chatroom.html',
		controller: 'ChatroomController'
	});

	$locationProvider.html5Mode(true);
}]);
