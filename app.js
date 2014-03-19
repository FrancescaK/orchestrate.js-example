var express = require('express')
var routes = require('./routes')
var user = require('./routes/user')
var http = require('http')
var path = require('path')
var app = express()

if (!process.env.ORCHESTRATE_KEY) {
  console.log('Orchestrate API Key required.')
  process.exit(1)
}

// Create a new orchestrate.js client
var db = require('orchestrate')(process.env.ORCHESTRATE_KEY)

app.set('port', 80)
app.set('views', __dirname + '/views')
app.set('view engine', 'hjs')
app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(app.router)
app.use(require('less-middleware')(__dirname + '/public'))
app.use(express.static(path.join(__dirname, 'public')))

if ('development' == app.get('env')) {
  app.use(express.errorHandler())
}

app.get('/', function (req, res) {
  res.render('index')
})

// Create a new user.
app.post('/users', function (req, res) {
  var body = req.body
  db.put('users', body.email, req.body)
  .then(function (result) {
    res.redirect('/users/' + body.email)
  })
  .fail(function (err) {
    res.end('Oops!')
  })
})

app.get('/users/create', function (req, res) {
  res.render('users/create')
})

// Search for users.
app.get('/users/search', function (req, res) {
  if (req.query && req.query.q && req.query.q.length > 0) {
    db.search('users', req.query.q)
    .then(function (result) {
      res.render('users/search', result.body)
    })
    .fail(function (err) {
      res.render('users/search')
    })
  } else {
    res.render('users/search')
  }
})

// Look up a user by key.
app.get('/users/:email', function (req, res) {
  db.get('users', req.params.email)
  .then(function (result) {
    res.render('users/show', result.body)
  })
  .fail(function (err) {
    res.end('No user found!')
  })
})

http.createServer(app).listen(app.get('port'), function (){
  console.log('Express server listening on port ' + app.get('port'))
})
