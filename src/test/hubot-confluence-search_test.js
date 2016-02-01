/*eslint-env es6*/
/*globals describe, beforeEach, afterEach, it */
process.env.HUBOT_CONFLUENCE_HOST = process.env.HUBOT_CONFLUENCE_HOST || "https://fake/";
process.env.HUBOT_CONFLUENCE_USERNAME = process.env.HUBOT_CONFLUENCE_USERNAME || "username";
process.env.HUBOT_CONFLUENCE_PASSWORD = process.env.HUBOT_CONFLUENCE_PASSWORD || "password";
process.env.EXPRESS_PORT = process.env.PORT = 0;

require("coffee-script/register");
require("should");
var sinon = require("sinon");

const wait_for_request_timeout = 100;

const Helper = require("hubot-test-helper");
const scriptHelper = new Helper("../scripts/hubot-confluence-search.js");
const confluence = new (require("../scripts/confluence.js"))("fake", "fake", "https://fake/");

var room; //eslint-disable-line

describe("hubot_confluence-search", function () {
  beforeEach(() => { room = scriptHelper.createRoom(); });
  afterEach(() => { room.destroy(); });

  describe("help", () => {
    it("lists help", () => {
      room.robot.helpCommands().should.eql([
        "hubot wiki <term> - Search term to look up"
      ]);
    });
  });
  describe("inline sentance", () => {
    beforeEach(() => {
      return room.user.say("Shell", "aasdadasdasd hubot wiki day one dev");
    });
    it("hubot wiki shouldn't work inline", () => {
      room.messages.should.be.eql([
        [ "Shell", "aasdadasdasd hubot wiki day one dev" ]
      ]);
    });
  });
  describe("no results", () => {
    beforeEach(() => {
      this.mock_confluence = sinon.mock(room.robot.confluence_search);
      this.mock_confluence.expects("simpleSearch").once().returns(
        Promise.resolve({ results: [] })
      );
      return room.user.say("Shell", "hubot wiki aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
    });
    it("hubot wiki should output nothing on empty response", () => {
      room.messages.should.be.eql([
        [ "Shell", "hubot wiki aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" ],
        [ "hubot", "Nothing found" ]
      ]);
      this.mock_confluence.verify();
    });
  });
  describe("single response", () => {
    beforeEach(() => {
      this.mock_confluence = sinon.mock(room.robot.confluence_search);
      this.mock_confluence.expects("simpleSearch").once().returns(
        Promise.resolve({ results: [
            {"id":"61344820","type":"page","title":"Dev Day One","_links":{"webui":"/display/AD/Dev+Day+One","tinyui":"/x/wAKu"}},
          ]
        })
      );
      return room.user.say("Shell", "hubot wiki dev day one");
    });

    it("hubot wiki should output one result on single response", () => {
      room.messages.should.be.eql([
        [ "Shell", "hubot wiki dev day one" ],
        [ "hubot", " * Dev Day One - " +
          process.env.HUBOT_CONFLUENCE_HOST + "x/wAKu" ]
      ]);
      this.mock_confluence.verify();
    });
  });
  describe("multiple response", () => {
    beforeEach(() => {
      this.mock_confluence = sinon.mock(room.robot.confluence_search);
      this.mock_confluence.expects("simpleSearch").once().returns(
        Promise.resolve({ results: [
            {"id":"61344820","type":"page","title":"Outage Procedure","_links":{"webui":"/display/AD/Outage+Procedure","tinyui":"/x/NAyoAw"}},
            {"id":"61344820","type":"page","title":"Other Outage Procedure","_links":{"webui":"/display/AD/Outage+Procedure","tinyui":"/x/meowmeow"}}
          ]
        })
      );
      return room.user.say("Shell", "hubot wiki outage");
    });

    it("hubot wiki should output one result on multiple response", () => {
      room.messages.should.be.eql([
        [ "Shell", "hubot wiki outage" ],
        [ "hubot", " " +
          "* Outage Procedure - " +
          process.env.HUBOT_CONFLUENCE_HOST + "x/NAyoAw" +
          "\n * Other Outage Procedure - " +
          process.env.HUBOT_CONFLUENCE_HOST + "x/meowmeow"
        ]
      ]);
      this.mock_confluence.verify();
    });
  });
});
