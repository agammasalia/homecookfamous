angular.module('SearchCtrl', []).controller('SearchCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	$http.get('/api/search')
	.success(function(data) {
		$scope.searchs = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

}]);
