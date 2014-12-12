var express			= require('express');
var app				= express();
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var mysql			= require('mysql');
var crypto			= require('crypto');
var fs				= require("fs");

var connection = mysql.createConnection({
	host		: 'localhost',
	user		: 'root',
	password	: '',
	database	: 'homecookfamous'
});
var port = process.env.PORT || 7000;

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
app.post('/api/login', function(req, res) {
	var sha1Password = crypto.createHash('sha1').update(req.body.password).digest("hex");
	var sqlQuery = 'SELECT * FROM `users` WHERE `userid` = "'+ req.body.userid +'" AND `password` = "'+ sha1Password +'"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json('Error');
		} else if (rows.length == 0) {
			res.json('Incorrect UserID or Password');
		} else {
			res.json('Success');
		}
	});
});

app.post('/api/signup', function(req, res) {
	var sqlQuery = 'SELECT * FROM `users` WHERE `userid` = "'+ req.body.userid +'"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json('Error');
		} else if (rows.length != 0) {
			res.json('UserID already in use');
		} else {
			var sha1Password = crypto.createHash('sha1').update(req.body.password).digest("hex");
			var sqlQuery2 = 'INSERT INTO `users`(`userid`, `password`, `firstname`, `lastname`, `email`, `dob`, `gender`, `phone`) VALUES ("'+ req.body.userid +'", "'+ sha1Password +'", "'+ req.body.firstname +'", "'+ req.body.lastname +'", "'+ req.body.email +'", "'+ req.body.dob +'", "'+ req.body.gender +'", "'+ req.body.phone +'")'
			console.log(sqlQuery2);
			connection.query(sqlQuery2, function(err, rows, fields) {
				var data = req.body.image.split(' ').join('+');
				var matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
				response = {};
				if (matches.length !== 3) {
					return new Error('Invalid input string');
				}
				response.type = matches[1];
				response.data = new Buffer(matches[2], 'base64');
				var imageBuffer = response;
				fs.writeFile('./public/images/user/'+rows.insertId+'.jpg', imageBuffer.data, function(err) {});
				res.json('Success');
			});
		}
	});
});

app.post('/api/recipe/add', function(req, res) {
	var sqlQuery = 'INSERT INTO `recipes`(`userid`, `name`, `ingredients`, `instructions`, `categories`, `country`, `one`, `two`, `three`, `four`, `five`) VALUES ("'+ req.body.userid +'", "'+ req.body.name +'", "'+ req.body.ingredients +'", "'+ req.body.instructions +'", "'+ req.body.categories +'", "'+ req.body.country +'", 0, 0, 0, 0, 0)';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json('Error');
		} else {
			var data = req.body.image.split(' ').join('+');
			var matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
			response = {};
			if (matches.length !== 3) {
				return new Error('Invalid input string');
			}
			response.type = matches[1];
			response.data = new Buffer(matches[2], 'base64');
			var imageBuffer = response;
			fs.writeFile('./public/images/recipe/'+rows.insertId+'.jpg', imageBuffer.data, function(err) {});
			res.json('Success');
		}
	});
});

app.get('/api/categorieslist', function(req, res) {
	var sqlQuery = 'SELECT DISTINCT `categories` FROM `recipes` ORDER BY `categories` ASC';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('/api/countrieslist', function(req, res) {
	var sqlQuery = 'SELECT DISTINCT `country` FROM `recipes` ORDER BY `country` ASC';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('/api/category/:categories', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `categories`= "' + req.params.categories + '"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('/api/country/:country', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `country`= "' + req.params.country + '"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('/api/recipe/:id', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `id`= ' + req.params.id;
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('/api/recipe/:id/:rating', function(req, res) {
	var r = req.params.rating;
	var sqlQuery = 'SELECT `'+ req.params.rating +'` FROM `recipes` WHERE `id`= ' + req.params.id;
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			var key = '';
			var val = '';
			for(n in rows) {
				for(o in rows[n]) {
					key = o;
				}
			}
			for(n in rows) {
				val = rows[n][key];
			}
			val = val+1;
			var sqlQuery2 = 'UPDATE `recipes` SET `'+req.params.rating+'`= "'+ val +'" WHERE `id`='+ req.params.id;
			connection.query(sqlQuery2);
			sqlQuery = 'SELECT * FROM `recipes` WHERE `id`= ' + req.params.id;
			connection.query(sqlQuery, function(err, rows, fields) {
			});
			res.redirect('/recipe/'+req.params.id);
		}
	});
});

app.get('/api/search', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes`';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			res.json(rows);
		}
	});
});

app.get('*', function(req, res) {
	res.sendfile('./public/index.html');
});

app.listen(port);
console.log('Application Running on port ' + port);
exports = module.exports = app;
