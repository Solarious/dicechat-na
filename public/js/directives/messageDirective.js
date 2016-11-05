angular.module('MessageDirective', [])
.directive('message', function() {
	return {
		restrict: 'E',
		templateUrl: 'views/messageTemplate.html'
	};
});
