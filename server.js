var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
db = require('./db')(); //global hack
var jwt = require('jsonwebtoken');
var cors = require('cors');

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObject(req) {
    var json = {
        headers : "No Headers",
        key: process.env.UNIQUE_KEY,
        body : "No Body",
        query : "No Queries"
    };

    if (req.body != null) {
        json.body = req.body;
    }
    if (req.headers != null) {
        json.headers = req.headers;
    }
    if (req.query != null) {
        json.query = req.query;
    }

    return json;
}

//Edited----------------------------------------------

//GET METHOD
router.get('/movies', function (req, res) {
    console.log('to movies GET method')
    var answers = getJSONObject(req);
    console.log(answers);
    res.status(200).send({status: 200, message: 'GET movies', headers: answers.headers, query: answers.query, env: answers.key});
})

//POST METHOD
router.post('/movies', function (req, res) {
    console.log('to movies POST method')
    var answers = getJSONObject(req);
    res.status(200).send({status: 200, message: 'movie saved', headers: answers.headers, query: answers.query, env: answers.key});
})

//PUT METHOD
router.route('/movies')
    .put(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var answers = getJSONObject(req);
            res.send({status: 200, message: 'movie updated', headers: answers.headers, query: answers.query, env: answers.key});        }
    );

//DELETE METHOD
router.route('/movies')
    .delete(authController.isAuthenticated, function (req, res) {
            res.send({status: 200, message: 'movie deleted', headers: answers.headers, query: answers.query, env: answers.key});
        }
    );
//End Edited----------------------------------------

router.route('/post')
    .post(authController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            var o = getJSONObject(req);
            res.json(o);
        }
    );

router.route('/postjwt')
    .post(authJwtController.isAuthenticated, function (req, res) {
            console.log(req.body);
            res = res.status(200);
            if (req.get('Content-Type')) {
                console.log("Content-Type: " + req.get('Content-Type'));
                res = res.type(req.get('Content-Type'));
            }
            res.send(req.body);
        }
    );

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please pass username and password.'});
    } else {
        var newUser = {
            username: req.body.username,
            password: req.body.password
        };
        // save the user
        db.save(newUser); //no duplicate checking
        res.json({success: true, msg: 'Successful created new user.'});
    }
});

router.post('/signin', function(req, res) {

    var user = db.findOne(req.body.username);

    if (!user) {
        res.status(401).send({success: false, msg: 'Authentication failed. User not found.'});
    }
    else {
        // check if password matches
        if (req.body.password == user.password)  {
            var userToken = { id : user.id, username: user.username };
            var token = jwt.sign(userToken, process.env.SECRET_KEY);
            res.json({success: true, token: 'JWT ' + token});
        }
        else {
            res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'});
        }
    };
});

app.use('/', router);
app.listen(process.env.PORT || 8080);

module.exports = app; // for testing
