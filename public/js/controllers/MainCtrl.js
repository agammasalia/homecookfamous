angular.module('MainCtrl', []).controller('MainCtrl', function($scope, $http) {

	$http.get('/api/categorieslist')
	.success(function(data) {
		$scope.categories = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

	$http.get('/api/countrieslist')
	.success(function(data) {
		$scope.countries = data;
	})
	.error(function(data) {
		console.log('Error: ' + data);
	});

});
