var express			= require('express');
var app				= express();
var bodyParser		= require('body-parser');
var methodOverride	= require('method-override');
var mysql			= require('mysql');
var crypto			= require('crypto');
var fs				= require("fs");
var request			= require("request");

var connection = mysql.createConnection({
	host		: 'localhost',
	user		: 'root',
	password	: '',
	database	: 'homecookfamous'
});
var port = process.env.PORT || 7000;

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
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

app.get('/recipe/:id/pdf', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `id`= ' + req.params.id;
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			var imageData = fs.readFileSync('./public/images/recipe/'+rows[0].id+'.jpg', 'base64');
			var data = "<center><h3>"+rows[0].name+"</h3><br><img width=100% src=\"data:image/jpeg;base64,";
			data += imageData+"\">";
			data += "</center><br><table border=1 width=100%><tr><td width=25%>Category</td><td>"+rows[0].categories+"</td></tr><tr><td>Country</td><td>"+rows[0].country+"</td></tr><tr><td>Ingredients</td><td>"+rows[0].ingredients+"</td></tr><tr><td>Instructions</td><td>"+rows[0].instructions+"</td></tr><tr><td>5 Star</td><td>"+rows[0].five+"</td></tr><tr><td>4 Star</td><td>"+rows[0].four+"</td></tr><tr><td>3 Star</td><td>"+rows[0].three+"</td></tr><tr><td>2 Star</td><td>"+rows[0].two+"</td></tr><tr><td>1 Star</td><td>"+rows[0].one+"</td></tr></table>";
			var html = "<html><body>" + data + "</body></html>";
			request.post({
				url: "https://sender.blockspring.com/api_v2/blocks/761172049d80626f51e221bb40e9b4b6?api_key=f987a8a22c5cf4f17f77c5e8e78cfd63",
				form: {
					html: html
				}
			},
			function(err, response, body) {
				var jsonData = JSON.parse(body);
				fs.writeFileSync('./public/'+jsonData.my_pdf.filename, jsonData.my_pdf.data, 'base64', function (err) {
					if (err) throw err;
				});
				var pdf = fs.readFileSync("./public/output.pdf");
				if (pdf == null) {
					res.json(err);
				} else {
					res.download('./public/output.pdf', 'HomeCookFamous.pdf');
				}
			});
		}
	});
});

app.get('/categorie/:category/pdf', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `categories` LIKE "%' + req.params.category + '%"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			var data = "";
			for(i in rows) {
				var imageData = fs.readFileSync('./public/images/recipe/'+rows[i].id+'.jpg', 'base64');
				data += "<center><h3>"+rows[i].name+"</h3><br><img width=100% src=\"data:image/jpeg;base64,";
				data += imageData+"\">";
				data += "</center><br><table border=1 width=100%><tr><td width=25%>Category</td><td>"+rows[i].categories+"</td></tr><tr><td>Country</td><td>"+rows[i].country+"</td></tr><tr><td>Ingredients</td><td>"+rows[i].ingredients+"</td></tr><tr><td>Instructions</td><td>"+rows[i].instructions+"</td></tr><tr><td>5 Star</td><td>"+rows[i].five+"</td></tr><tr><td>4 Star</td><td>"+rows[i].four+"</td></tr><tr><td>3 Star</td><td>"+rows[i].three+"</td></tr><tr><td>2 Star</td><td>"+rows[i].two+"</td></tr><tr><td>1 Star</td><td>"+rows[i].one+"</td></tr></table>";
			}
			var html = "<html><style type=\"text/css\">table { page-break-after: always; }</style><body>" + data + "</body></html>";
			request.post({
				url: "https://sender.blockspring.com/api_v2/blocks/761172049d80626f51e221bb40e9b4b6?api_key=f987a8a22c5cf4f17f77c5e8e78cfd63",
				form: {
					html: html
				}
			},
			function(err, response, body) {
				var jsonData = JSON.parse(body);
				fs.writeFileSync('./public/'+jsonData.my_pdf.filename, jsonData.my_pdf.data, 'base64', function (err) {
					if (err) throw err;
				});
				var pdf = fs.readFileSync("./public/output.pdf");
				if (pdf == null) {
					res.json(err);
				} else {
					res.download('./public/output.pdf', 'HomeCookFamous.pdf');
				}
			});
		}
	});
});

app.get('/country/:country/pdf', function(req, res) {
	var sqlQuery = 'SELECT * FROM `recipes` WHERE `country` LIKE "%' + req.params.country + '%"';
	connection.query(sqlQuery, function(err, rows, fields) {
		if (err) {
			res.json(err);
		} else {
			var data = "";
			for(i in rows) {
				var imageData = fs.readFileSync('./public/images/recipe/'+rows[i].id+'.jpg', 'base64');
				data += "<center><h3>"+rows[i].name+"</h3><br><img width=100% src=\"data:image/jpeg;base64,";
				data += imageData+"\">";
				data += "</center><br><table border=1 width=100%><tr><td width=25%>Category</td><td>"+rows[i].categories+"</td></tr><tr><td>Country</td><td>"+rows[i].country+"</td></tr><tr><td>Ingredients</td><td>"+rows[i].ingredients+"</td></tr><tr><td>Instructions</td><td>"+rows[i].instructions+"</td></tr><tr><td>5 Star</td><td>"+rows[i].five+"</td></tr><tr><td>4 Star</td><td>"+rows[i].four+"</td></tr><tr><td>3 Star</td><td>"+rows[i].three+"</td></tr><tr><td>2 Star</td><td>"+rows[i].two+"</td></tr><tr><td>1 Star</td><td>"+rows[i].one+"</td></tr></table>";
			}
			var html = "<html><style type=\"text/css\">table { page-break-after: always; }</style><body>" + data + "</body></html>";
			request.post({
				url: "https://sender.blockspring.com/api_v2/blocks/761172049d80626f51e221bb40e9b4b6?api_key=f987a8a22c5cf4f17f77c5e8e78cfd63",
				form: {
					html: html
				}
			},
			function(err, response, body) {
				var jsonData = JSON.parse(body);
				fs.writeFileSync('./public/'+jsonData.my_pdf.filename, jsonData.my_pdf.data, 'base64', function (err) {
					if (err) throw err;
				});
				var pdf = fs.readFileSync("./public/output.pdf");
				if (pdf == null) {
					res.json(err);
				} else {
					res.download('./public/output.pdf', 'HomeCookFamous.pdf');
				}
			});
		}
	});
});

app.get('/api/search', function(req, res) {
	if(typeof req.query.search !== 'undefined') {
		var sqlQuery = 'SELECT * FROM `recipes` WHERE UPPER(`name`) LIKE UPPER("%'+req.query.search+'%")';
	} else {
		var sqlQuery = 'SELECT * FROM `recipes`';
	}
	console.log(sqlQuery);
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
