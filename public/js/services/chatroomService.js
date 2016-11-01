angular.module('ChatroomService', [])
.factory('Chatrooms', ['$http', function($http) {
	return {
		get: function(chatroomName) {
			if (name==null)
				return $http.get('/api/chatrooms');
			else
				return $http.get('/api/chatrooms/' + name);
		},
		create: function(chatroomName, chatroomPassword) {
			var chatroomData = {
				name: chatroomName,
				password: chatroomPassword
			};
			return $http.post('/api/chatrooms', chatroomData);
		}
	};
}]);
