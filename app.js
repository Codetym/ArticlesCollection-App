//importing express
const express = require('express');
const path = require('path');

//importing mongoose
const mongoose = require('mongoose');

//importing bodyParser
const bodyParser = require('body-parser');

//import express-validator
const expressValidator = require('express-validator');

//import flash-connect
const flash = require('connect-flash');

//import express-session
const session = require('express-session');
//bring in passport
const passport = require('passport');
//connection to the db
const config = require('./config/database');
mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;

//check connection
db.once('open', () => {
	console.log('Connected to MongoDB');
})

//check for dn errors
db.on('error', (err) => {
	console.log(err);
})

//init app
const app = express();
app.use(express.urlencoded());

//bring in models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


//adding bodyParser middleqware

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//set public static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session middleware
app.use(session({
	secret: 'keyboard cat',
	resave: 'true',
	saveUninitialized: 'true'
}));

//Express messages middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//express validator middleware
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		var namespace = param.split('.'),
		root = namespace.shift(),
		formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param    : formParam,
			msg      : msg,
			value    : value
		};
	}
}));

//passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//
app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});

//add home route
app.get('/', (req, res) => {
	Article.find({}, (err, articles) => {
		if (err) {
			console.log(err);
		}
		else {
			res.render('index', {
				title: 'ARTICLES',
				articles: articles
			});
		}
	});
});

//Route Files
let articles = require('./routes/articles');
let users = require('./routes/users');
app.use('/articles', articles);
app.use('/users', users);

//start server
app.listen(3000, () => {
	console.log('Server started on port 3000');
});
