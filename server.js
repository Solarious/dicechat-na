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

// redirect to https on production
var https_redirect = function(req, res, next) {
	if (req.headers['x-forwarded-proto'] !== 'https') {
		console.log('redirection to https occuring');
		return res.redirect('https://' + req.headers.host + req.url);
	} else {
		return next();
	}
};
if (process.env.NODE_ENV === 'production') {
	app.use(https_redirect);
	console.log('using https redirect');
}

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
