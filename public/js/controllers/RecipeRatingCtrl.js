angular.module('RecipeRatingCtrl', []).controller('RecipeRatingCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	$http.get('/api/recipe/'+$routeParams.id+'/'+$routeParams.rating+'')
	.success(function(data) {
		$scope.recipes = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

}]);
