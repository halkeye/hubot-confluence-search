require('es6-promise').polyfill();

var request = require('request');
var url = require('url');

module.exports = function(username, password, hostname) {
  var uri = url.resolve(hostname, '/rest/api/content/search');
  return {
    simpleSearch: function(cql) {
      return new Promise(function(resolve, reject) {
        request({
          method: 'GET',
          uri: uri,
          json: true,
          qs: {
            limit: 5,
            cql : cql
          },
          auth: {
            'user': username,
            'pass': password,
            'sendImmediately': true
          },
        }, function( err, response, results) {
          if (err) { return reject(err); }
          //Check for right status code
          if(response.statusCode !== 200) {
            var bod = JSON.stringify(response.body);
            return reject('Invalid Status Code Returned: ' + response.statusCode + ' - ' + response.body.message);
          }

          if (!results) { return reject("empty result object"); }
          return resolve(results);
        });
      });
    }
  };
};
