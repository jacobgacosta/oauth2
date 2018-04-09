'use strict';

var googleProvider = require('../../social')

module.exports = function(app) {
    app.get('/google', function (req, res) {
        googleProvider.authorize(res);
    })

    app.get('/callback', function (req, res) {
        googleProvider.getToken(req, function (token) {
            googleProvider.getUser(token, function (user) {
                console.log(user);
            });
        });
    })
};
