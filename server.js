var express = require('express');
var app = express();
var http = require('http').Server(app);
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var morgan = require('morgan');

var port = process.env.PORT;
var dburl = process.env.MONGODB_URI;

mongoose.connect(dburl);

app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
// fix for 304
app.disable('etag');

require('./app/routes')(app);
require('./app/chat')(http);

http.listen(port);
console.log('Server started on port ' + port);

exports = module.exports = app;
