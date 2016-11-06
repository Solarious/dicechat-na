angular.module('DiceDirective', [])
.directive('dice', function() {
	return {
		restrict: 'E',
		templateUrl: 'views/diceTemplate.html'
	};
});
