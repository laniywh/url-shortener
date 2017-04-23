var express = require('express');
var mongoose = require('mongoose');

var app = express();

app.set('view engine', 'ejs');

var port = process.env.PORT || 3000;


mongoose.connect('mongodb://lani:102030@ds129600.mlab.com:29600/urlshortener');

var Redirect = mongoose.model('Redirect', {
    shortURLCode: String,
    url: String
});


// Create short URL
app.get(/new\/(https?:\/\/.+)/, function (req, res) {

    var code = generateCode();
    console.log('code: ' + code);

    findRedirect(code, req, res);

});


function generateCode() {

    var MAX = 9999;
    var MIN = 1000;

    return Math.floor(Math.random() * (MAX - MIN + 1) + MIN);

}

function findRedirect(code, req, res) {

    // look for duplicate in database
    Redirect.findOne({ shortURLCode: code }, function (err, redirect) {
        if (err) throw err;

        if (redirect) {
            console.log('find duplicate');

            // generate another code and check again for duplicate
            code = generateCode();
            console.log('try another code: ' + code);
            findRedirect(code, req, res);

        } else {
            // save code and url to database
            var redirect = new Redirect({
                shortURLCode: code,
                url: req.params[0]
            });

            redirect.save(function (err) {

                if (err) {
                    res.json({
                        "error": "Wrong URL format"
                    });
                } else {
                    var host = req.get('host');
                    res.json({
                        "original_url": req.params[0],
                        "short_url": host + '/' + code
                    });
                }
            });
        }

    });
}


// Redirection
app.get('/:code', function (req, res) {

    // find url assosiated w/ code
    Redirect.find({ shortURLCode: req.params.code }, function (err, data) {
        if (err) throw err;

        if (data.length > 0) {
            res.redirect(301, data[0].url);
        } else {
            res.json({
                "error": "This URL is not on the database"
            });
        }
    });
});


app.get('/', function(req, res) {
    res.send('hello world');
});

app.listen(port);
