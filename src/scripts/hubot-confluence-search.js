// Description:
//   Confluence Integration
//
// Dependencies:
//   None
//
// Configuration:
//   HUBOT_CONFLUENCE_HOST - Confluence's base url (ie http://localhost:8080/confluence/)
//   HUBOT_CONFLUENCE_USERNAME - Confluence username
//   HUBOT_CONFLUENCE_PASSWORD - password
//
// Commands:
//   hubot wiki <term> - Search term to look up
//
// Notes:
//   Copyright (c) 2016 Gavin Mogan
//   Licensed under the MIT license.
//
// Author:
//   halkeye

"use strict";
var url = require("url");

var username = process.env.HUBOT_CONFLUENCE_USERNAME;
var password = process.env.HUBOT_CONFLUENCE_PASSWORD;
var host = process.env.HUBOT_CONFLUENCE_HOST;

var uri = url.resolve(host, '/rest/api/content/search');

module.exports = function (robot) {
  robot.confluence_search = new require('./confluence.js')(username, password, host);

  //robot.parseHelp(__filename);
  robot.respond(/wiki\s*(.*)$/, function (res) {
    robot.confluence_search.simpleSearch(res.match[1]).then(function(results) {
      if (results.results.length === 0) {
        res.send( 'Nothing found' );
        return;
      }

      res.send( results.results.map(function(result) {
          return " * " + result.title + " - " +  url.resolve(process.env.HUBOT_CONFLUENCE_HOST, result._links.tinyui);
      }).join("\n") );
    }).catch(function(err) {
      console.error("Error from confluence:", err);
    });
  });
};
