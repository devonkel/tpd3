var express = require('express'),
    session = require('express-session'),
    nodemailer = require('nodemailer'),
    configs = require('./config.js'),
    credentials = require('./credentials.js');

var app = express();

var handlebars = require('express-handlebars').create({
	defaultLayout: 'main',
	helpers: {
		section: function(name, options){
			if(!this._sections) this._sections = {};
			this._sections[name] = options.fn(this);
			return null;
		}
	}
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
// console.log('Configs: \n=== PORT: ', configs.port);
app.set('port', process.env.PORT || configs.port);

app.use(express.static(__dirname + '/public'));

var mailTransport = nodemailer.createTransport('SMTP',{
	service: 'Gmail',
  auth: {
  	user: credentials.gmail.user,
  	pass: credentials.gmail.password,
	}
});


app.use(function(req, res, next) {
    res.locals.showTests = app.get('env') != 'production' &&
        req.query.test === '1';
    next();
});

app.use(session({
  secret: credentials.cookieSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

app.get('/', function(req, res){
    res.render('home');
});

app.get('/about', function(req, res){
    res.render('about');
});

// custom 404 page
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// custom 500 page
app.use(function(err, req, res, next){
	console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
	console.log( 'Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.' );
});
