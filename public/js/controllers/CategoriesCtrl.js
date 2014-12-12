angular.module('CategoriesCtrl', []).controller('CategoriesCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	$http.get('/api/category/'+$routeParams.categories)
	.success(function(data) {
		$scope.title = $routeParams.categories;
		$scope.categories = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

}]);
