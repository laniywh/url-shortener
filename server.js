var express = require('express');

var app = express();

app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
    res.send('hello world');
});

app.listen(port);