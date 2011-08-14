var assert = require('assert'), commit_message_parser = require('commit_message_parser');

module.exports = {
    'parse()': function(){
        assert.eql(["Ken", "Alex"], commit_message_parser.parse("Ken/Alex #266 added empty authors column so that subjects appear in 3rd column"));
        assert.eql(["Alinoor", "Mark"], commit_message_parser.parse("alinoor/mark #380 more stuff this time for chapter title"));

    }
};
