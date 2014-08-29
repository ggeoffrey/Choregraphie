express = require 'express'
path = require 'path'
favicon = require 'static-favicon'
logger = require 'morgan'
cookieParser = require 'cookie-parser'
bodyParser = require 'body-parser'
compression = require 'compression'
routes = require './routes/index'
angularTemplates = require './routes/angularTemplates'

config = require './config'


app = express()


# Added by Geoffrey
http = require('http').Server(app)
http.listen config.port

io = require 'socket.io'

restApi = require('./modules/restApi')
socketManager = require('./modules/socketManager')(io, http)
socketManager.listenToSockets()
# -----------------------------
	






# view engine setup
app.set 'views', path.join(__dirname, 'views')
app.set 'view engine', 'jade'

app.use favicon()
app.use logger('dev')
app.use compression()

app.use bodyParser.json()
app.use bodyParser.urlencoded()
app.use cookieParser()
app.use require('stylus').middleware(path.join(__dirname, 'public'))
app.use express.static(path.join(__dirname, 'public'))



# ROUTES


app.use '/', routes
app.use '/template', angularTemplates
app.use '/api', restApi


# catch 404 and forward to error handler
app.use (req, res, next)->
	err = new Error 'Not Found'
	err.status = 404
	next err

# error handlers

# development error handler
# will print stack trace
if app.get('env') is 'development'
	app.locals.pretty = on
	app.use (err, req, res, next)->
		res.status err.status or 500
		res.render 'error', {
			message: err.message
			error: err
		}


# production error handler
# no stack traces leaked to user
app.use (err, req, res, next)->
	res.status err.status or 500
	res.render 'error', {
		message: err.message
		error: {}
	}


module.exports = app