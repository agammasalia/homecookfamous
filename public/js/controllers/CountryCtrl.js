angular.module('CountryCtrl', []).controller('CountryCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

	$http.get('/api/country/'+$routeParams.country)
	.success(function(data) {
		$scope.title = $routeParams.country;
		$scope.countries = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

}]);
