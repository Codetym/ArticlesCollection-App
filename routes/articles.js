const express = require('express');
const router = express.Router();
const passport = require('passport');

//bring in article models
let Article = require('../models/article');
//user model
let User = require('../models/user');


//Add View route
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('add_article', {
		title: 'Add Article'
	});
});

//add submit post route
router.post('/add', (req, res) => {

    //error msgs incase any field is left empty
    req.checkBody('title', 'Title is Required').notEmpty();
    //req.checkBody('author', 'Author is Required').notEmpty();
    req.checkBody('body', 'Body is Required').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if(errors) {
       res.render('add_article', {
           title: 'Add Article',
           errors:errors
       });
       }
    else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save( (err) => {
            if (err) {
                console.log(err);
                return;
            } else {
                req.flash('info', 'Article Added!');
                res.redirect('/');
            }
        });
    }
});

//load edit form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Article.findById(req.params.id, (err, article) =>{
		if (article.author != req.user._id) {
			req.flash('danger', 'Access Not Authorized!');
			res.redirect('/');
		}
		res.render('edit_article', {
			title:'Edit Article',
			article:article
		});
	});
});

//update submit post route
router.post('/edit/:id', (req, res) => {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;

	let query = {_id:req.params.id}
	Article.update( query, article, (err) => {
		if (err) {
			console.log(err);
			return;
		} else {
            req.flash('info', 'Article Updated!');
			res.redirect('/');
		}
	});
});

//delete request route
router.delete('/:id', (req, res) => {
	if (!req.user._id) {
		res.status(500).send();
	}
	let query = {_id:req.params.id}

	Article.findById(req.params.id, (err, article) => {
		if (article.author != req.user._id) {
			res.status(500).send();
		} else {
				Article.deleteMany(query, (err) => {
					if (err) {
						console.log(err)
					}
			        req.flash('danger', 'Article Deleted!');
					res.send('Success!');
		});

		}
	});
});

//Get each article
router.get('/:id', (req, res) => {
	Article.findById(req.params.id, (err, article) =>{
		User.findById(article.author, (err, user) => {
			res.render('article', {
			article:article,
			author: user.name
		});
		});
	});
});

//Access control
function ensureAuthenticated(req, res, next){
	if (req.isAuthenticated()) {
		return next();
	}
	else {
		req.flash('danger', 'Please Login!');
		res.redirect('/users/login');
	}
}

module.exports = router;
