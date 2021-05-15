var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

//ÄÚµå
var db_connection = require('./routes/db_connection');
var get_data = require('./routes/get_data');
var get_main_data = require('./routes/get_main_data');
var get_user_data = require('./routes/get_user_data');
var get_mypage_data = require('./routes/get_mypage_data');
var get_ranking = require('./routes/get_ranking');
var fileupload = require('./routes/fileupload');
var review = require('./routes/review');
var signup = require('./routes/signup');
var login = require('./routes/login');
var user_check = require('./routes/user_check');
var find_user = require('./routes/find_user');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/db_connection', db_connection);
app.use('/get_data', get_data);
app.use('/get_main_data', get_main_data);
app.use('/get_user_data', get_user_data);
app.use('/get_mypage_data', get_mypage_data);
app.use('/get_ranking', get_ranking);
app.use('/fileupload', fileupload);
app.use('/review', review);
app.use('/signup', signup);
app.use('/login', login);
app.use('/user_check', user_check);
app.use('/find_user', find_user);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
