const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//bring in User models
let User = require('../models/user');

//Add View route
router.get('/register', (req, res) => {
  res.render('register', {
    title: 'CREATE ACCOUNT'
  });
});
/*Register form
router.get('/register', (req, res)=>{
  res.render('register');
});*/

//Register process
router.post('/register', (req, res)=>{
  const name      = req.body.name;
  const email     = req.body.email;
  const username  = req.body.username;
  const password  = req.body.password;
  const password1 = req.body.password1;

  //validation
  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password1', 'Passwords Do not Match').equals(req.body.password);

  //get the errors
  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors: errors
    });
  }
  else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) {
          console.console.log(err);
        }

        newUser.password = hash;
        newUser.save( function(err) {
          if (err) {
            console.log(err);
            return;
          }
          else {
            req.flash('info', 'Registration Successful!\n You Can Now Log In.');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});

//log form
router.get('/login', (req, res) => {
  res.render('login');
});

//login process
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

//Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('warning', 'You Are Logged Out!');
  res.redirect('/users/login');
});

//export routes
module.exports = router;
