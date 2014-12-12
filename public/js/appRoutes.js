angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

	$routeProvider

	.when('/', {
		templateUrl: 'views/home.html',
		controller: 'MainCtrl'
	})

	.when('/categorie/:categories', {
		templateUrl: 'views/categories.html',
		controller: 'CategoriesCtrl'
	})

	.when('/country/:country', {
		templateUrl: 'views/country.html',
		controller: 'CountryCtrl'
	})

	.when('/recipe/:id', {
		templateUrl: 'views/recipeDetail.html',
		controller: 'RecipeDetailCtrl'
	})

	.when('/recipe/:id/:rating', {
		templateUrl: 'views/recipeDetail.html',
		controller: 'RecipeRatingCtrl'
	})

	.when('/search', {
		templateUrl: 'views/search.html',
		controller: 'SearchCtrl'
	})

	$locationProvider.html5Mode(true);

}]);
