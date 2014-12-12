angular.module('RecipeDetailCtrl', []).controller('RecipeDetailCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	$http.get('/api/recipe/'+$routeParams.id)
	.success(function(data) {
		$scope.recipes = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

}]);
