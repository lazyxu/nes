var express = require('express');
var app = express();

app.use(express.static('public'));

var server = app.listen(2018, function () {
    var port = server.address().port;
    console.log("Listening on Port ", port)
});