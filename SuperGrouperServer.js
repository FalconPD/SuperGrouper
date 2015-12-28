var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var uuid = require('node-uuid');
var fs = require('fs');

const PORT=8080;
const PATH="/SuperGrouper";

app.use(PATH, express.static('client'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//app.get('/', function (req, res) {
//	console.log("Got here");
//	res.sendFile("client/index.html");
//});

app.get(PATH + '/load', function (req, res) {

	if (/^[a-z0-9\-]+$/.test(req.query.id))
	{
		var filename = "saved_groups/" + req.query.id + ".json";
		console.log("Reading group file " + filename);
		fs.readFile(filename, function(err, data) {
			if (err) {
				res.writeHead(404, { 'Content-Type': 'application/json' });
				res.end();
				return console.log(err);
			}
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(data);
		});
	}
	else
	{
		res.writeHead(400, { 'Content-Type': 'application/json' });
		res.end();
		console.log("Invalid id " + req.query.id);
	}
});


app.post(PATH + '/save', function (req, res) {
	var id = uuid.v1();
	var filename = "saved_groups/" + id + ".json";
	console.log("Saving group file " + filename);
	fs.writeFile(filename, JSON.stringify(req.body), function(err) {
		if (err) {
			return console.log(err);
		}
	});
	//should I JSON.stringify the id?
	//should this be send or end?
	res.send(id);
});

var server = app.listen(PORT, "localhost", function () {

	var host = server.address().address
	var port = server.address().port

	console.log("SuperGrouperServer listening at http://%s:%s", host, port)
});
