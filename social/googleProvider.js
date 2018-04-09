var fs = require('fs');
var readline = require('readline');
var googleAuth = require('google-auth-library');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
var CREDENTIALS_FILE_NAME = 'client_secret.json';
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];


/**
 * Request an authorization code.
 *
 * @param {Object} response The response to do the redirect callback.
 */
exports.authorize = function (response) {
    checkByExistentToken(function (err, token) {
        getOauth2Client(function (oauth2Client) {
            if (err) {
                var authUrl = oauth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: SCOPES
                });

                response.redirect(authUrl);
                return;
            }
            response.redirect(oauth2Client.redirectUri[0]);
        });
    });
}

/**
 * Check if a token exist.
 *
 * @param {function} response The callback to call with the search response.
 */
function checkByExistentToken(callback) {
    fs.readFile(TOKEN_PATH, function(err, token) {
        callback(err, token);
  });
}

/**
 * Check if a token exist.
 *
 * @param {Object} request The request to get the query param {code}.
 * @param {function} callback The callback to call with the search response.
 */
exports.getToken = function (request, callback) {
    checkByExistentToken(function (err, token) {
        getOauth2Client(function (oauth2Client) {
            if (err) {
                oauth2Client.getToken(request.query.code, function(err, token) {
                    if (err) {
                        console.log('Error while trying to retrieve access token', err);
                        return;
                    }

                    oauth2Client.credentials = token;
                    storeToken(token);
                    callback(token);
                });
                return;
            }

            callback( JSON.parse(token));
        });
    });
}

/**
 * Gets a request user.
 *
 * @param {Object} token The token object.
 */
exports.getUser = function (token, callback) {
    getOauth2Client(function (oauth2Client) {
        oauth2Client.credentials =  token;

        var gmail = google.gmail('v1');
        gmail.users.getProfile({
            auth: oauth2Client,
            userId: 'me'
        }, function(err, res) {
            if (err) {
                console.log(err);
            } else {
                callback(res.data);
            }
        });
    });
}

/**
 * Stores the token.
 *
 * @param {Object} token The token object.
 */
function storeToken(token) {
  try {
      fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
      if (err.code != 'EEXIST') {
          throw err;
      }
  }
    fs.writeFile(TOKEN_PATH, JSON.stringify(token));
    console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Gets an oauth2Client.
 *
 * @param {Object} token The token object.
 */
function getOauth2Client(callback) {
    fs.readFile(CREDENTIALS_FILE_NAME, function (err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        var json = JSON.parse(content)

        var oauth2Client =new OAuth2(
            json.installed.client_id,
            json.installed.client_secret,
            json.installed.redirect_uris);

        callback(oauth2Client);
    });
}
