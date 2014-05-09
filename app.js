var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(session({ secret: 'abcdef', cookie: { maxAge : 3600000 }}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());


var locationapi = require('./routes/locationapi');
app.get('/api/locations', ensureAuthenticated, locationapi.getAllLocations);
app.get('/api/locations/:id', ensureAuthenticated, locationapi.readlocationbyid);
app.post('/api/locations', ensureAuthenticated, locationapi.createlocation);
app.put('/api/locations/:id', ensureAuthenticated, locationapi.updatelocation);
app.del('/api/locations/:id', ensureAuthenticated, locationapi.deletelocation);



app.get('/', ensureAuthenticated, function (req,res) {
    //Specifying different open and close tags for ejs as underscorejs uses same tags
    res.render('index',{ open: "^%", close: "%^", user:req.user});
});
app.get('/login', function (req, res) {
    res.render('login.html');
});
app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }), function (req,res) {
    res.redirect('/') ; 
});
app.get('/logout', function (req, res) {
   req.logout();
   res.redirect('/login');   
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {req.params.userid=req.user;
                     return next(); }
    else res.redirect('/login');
}

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        if ((username=="uber1" || username=="uber2") && password=="Welcome") {
            return done(null,username);
        }
        else return done(null, false);
    }
));
/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
