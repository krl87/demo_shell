var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// 1) add dependencies for password recovery

var session = require('express-session');
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var async = require('async');
var bcrypt = require('bcrypt-nodejs');
var flash = require('express-flash');
var smtpTransport = require('nodemailer-smtp-transport');
//part of express library
var crypto = require('crypto');


var app = express();

// (7) set up local strategy















//8) serialize and deserialize

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


// 3) create user model with a Schema



















// 4) use bcrypt to hash the password


















// 5) password verification








// 6) use the User model
var User = mongoose.model('User', userSchema);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// 2) passport config section

app.use(session({
    secret: 'put in mlab password',
    resave: true,
    saveUninitialized: false
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


//routes
app.get('/', function (req, res, next) {
    res.render('index', {
        title: 'Comp2106 Forgot Password Tutorial'
    });
});


//add login
app.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'Login',
        user: req.user
    });
});

app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err)
        if (!user) {
            return res.redirect('/login')
        }
        req.logIn(user, function (err) {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});

//sign up
app.get('/signup', function (req, res, next) {
    res.render('signup', {
        title: 'Register',
        user: req.user
    });
});

//create a POST route to handle the form on the signup page.

app.post('/signup', function (req, res, next) {
    var user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    });
    user.save(function (err) {
        req.logIn(user, function (err) {
            res.redirect('/');
        });
    });
});

//logout route

app.get('/logout', function (req, res, next) {
    req.logout();
    res.redirect('/');
});

//forgot route handlers
app.get('/forgot', function (req, res, next) {
    res.render('forgot', {
        title: 'Reset Password',
        user: req.user
    });
});

// 10) forgot post handler






















        function (token, user, done) {
            var options = {
                service: 'Mailgun',
                auth: {
                    user: 'postmaster@Sandbox65b418bcf76c4a5e909aedb7b6e87b45.mailgun.org',
                    pass: '847f704c64e240d0f6cc29966c6f03ab'
                }
            };
            var transporter = nodemailer.createTransport(smtpTransport(options))

            var mailOptions = {
                to: user.email,
                from: 'postmaster@Sandbox65b418bcf76c4a5e909aedb7b6e87b45.mailgun.org',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function (err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});


// reset route
app.get('/reset/:token', function (req, res, next) {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, function (err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            title: 'Reset Password',
            user: req.user
        });
    });
});


// 11) get handler for reset token























        function (user, done) {
            var options = {
                service: 'Mailgun',
                auth: {
                    user: 'postmaster@Sandbox65b418bcf76c4a5e909aedb7b6e87b45.mailgun.org',
                    pass: '847f704c64e240d0f6cc29966c6f03ab'
                }
            };
            var transporter = nodemailer.createTransport(smtpTransport(options))

            var mailOptions = {
                to: user.email,
                from: 'postmaster@Sandbox65b418bcf76c4a5e909aedb7b6e87b45.mailgun.org',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            transporter.sendMail(mailOptions, function (err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err, 'done');
            });
        }
    ], function (err) {
        res.redirect('/');
    });
});


// db connection (keep)
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'DB Error: '));

db.once('open', function (callback) {
    console.log('Connected to mongodb');
});


// read db connection string from our config file
var configDb = require('./config/db.js');
mongoose.connect(configDb.url);


module.exports = app;
