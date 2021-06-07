const express = require('express');
const cors = require('cors');
var session = require('express-session');
var mongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const https = require('https');
const db = require('./db/db');

const authRoute = require('./routes/authRoute');
const shopRoute = require('./routes/shopRoute');
const adRoute = require('./routes/adRoute');
const photoRoute = require('./routes/photoRoute');
const ratingRoute = require('./routes/ratingRoute');
const commentRoute = require('./routes/commentRoute');
const accountRoute = require('./routes/accountRoute');
const authCheckRoute = require('./routes/authCheckRoute');
const homePageRoute = require('./routes/homePageRoute');
const detailsRoute = require('./routes/detailsRoute');
const commonRoute = require('./routes/commonRoute');
const shoppingRoute = require('./routes/shoppingRoute');
const deliveryRoute = require('./routes/deliveryRoute');
const searchRoute = require('./routes/searchRoute');
const deliveryPersonRoute = require('./routes/deliveryPersonRoute');
const orderRoute = require('./routes/orderRoute');
const adminRoute = require('./routes/adminRoute');
const salesRoute = require('./routes/salesRoute');
const contactRoute = require('./routes/contactRoute');
const reportRoute = require('./routes/reportRoute');
const imposeRoute = require('./routes/imposeRoute');

mongoose.connect(db.DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    () => {console.log('Database is connected')},
    err => {console.log('Can not connect to the database' + err)}
);

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('*.css', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/css');
    }
    next();
});

app.get('*.eot', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'application/vnd.ms-fontobject');
    }
    next();
});

app.get('*.gif', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'image/gif');
    }
    next();
});

app.get('*.html', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/html');
    }
    next();
});

app.get('*.js', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/js');
    }
    next();
});

app.get('*.json', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'application/json');
    }
    next();
});

app.get('*.map', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'application/octet-stream');
    }
    next();
});

app.get('*.php', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'application/x-httpd-php');
    }
    next();
});

app.get('*.png', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'image/png');
    }
    next();
});

app.get('*.svg', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'image/svg+xml');
    }
    next();
});

app.get('*.ttf', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'font/ttf');
    }
    next();
});

app.get('*.txt', function(req, res, next) {
    if(req.header('Accept-Encoding') && req.header('Accept-Encoding').includes('gz')) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        res.set('Content-Type', 'text/plain');
    }
    next();
});

app.use(express.static(path.join(__dirname,'build')));

var store = new mongoDBStore({
    uri: db.DB,
    collection: 'sessions'
});

app.use(session({
    secret: 'e7f2dd681ea288ba770758856951ed35f6498b36062b950556b422707c661525578e993d5179912d6034740be20d54c24f2cfa10913b0bed91fbf4cb80eef8c3',
    cookie: {
        domain: "nahidsultan.com",
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 24 * 365 // 365 days
    },
    store: store,
    resave: false,
    saveUninitialized: true
}));

app.use('/api/users',authRoute);
app.use('/api/shops',shopRoute);
app.use('/api/ads',adRoute);
app.use('/api/photo',photoRoute);
app.use('/api/rate',ratingRoute);
app.use('/api/comment',commentRoute);
app.use('/api/shopping',shoppingRoute);
app.use('/api/account',accountRoute);
app.use('/api/auth-check',authCheckRoute);
app.use('/api/homepage',homePageRoute);
app.use('/api/details',detailsRoute);
app.use('/api/deliveries',deliveryRoute);
app.use('/api/search',searchRoute);
app.use('/api/delivery-person',deliveryPersonRoute)
app.use('/api/orders',orderRoute);
app.use('/api/admin',adminRoute);
app.use('/api/sales',salesRoute);
app.use('/api',commonRoute);
app.use('/api/contact',contactRoute);
app.use('/api/report',reportRoute);
app.use('/api/impose',imposeRoute);

app.get('*',function(req,res) {
    res.sendFile(path.resolve(__dirname,'build','index.html'));
});

const PORT = 5000;

var options = {
    key: fs.readFileSync('./ssl/privatekey.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem'),
};

https.createServer(options, app).listen(PORT, function(){
    console.log(`Secured server is running on PORT ${PORT}`);
});