var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var compression = require('compression');

var routes = require('./routes/index');
var angularTemplates = require('./routes/angularTemplates');


var app = express();


    // Ajouté par Geoffrey
        var http = require('http').Server(app);
        http.listen(3001);
    
        var io = require('socket.io')(http);
        
        var restApi = require('./modules/restApi');  
        var socketManager = require('./modules/socketManager')(io);
        socketManager.listenToSockets();
    // -----------------------------
    






// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(compression());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));



// ROUTES


app.use('/', routes);
app.use('/template', angularTemplates);
app.use('/api', restApi);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.locals.pretty = true;
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