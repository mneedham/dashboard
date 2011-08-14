var assert = require('assert'), commit_message_parser = require('commit_message_parser');

module.exports = {
    'parse()': function(){
        assert.eql(["Ken", "Alex"], commit_message_parser.parse("Ken/Alex #266 added empty authors column so that subjects appear in 3rd column"));
        assert.eql(["Alinoor", "Mark"], commit_message_parser.parse("alinoor/mark #380 more stuff this time for chapter title"));
        assert.eql(["Mark", "Suzuki"], commit_message_parser.parse("mark,suzuki #232 fix merge"));
	    assert.eql(["Pat", "Sebastian"], commit_message_parser.parse("pat, sebastian: removing unnecessary line in dev properties."));
	    assert.eql([], commit_message_parser.parse("Merge branch 'master' of segblogr0065:core"));
	    assert.eql(["Karl"], commit_message_parser.parse("Karl: styled subheading h3 for #519"));
	    assert.eql(["Alinoor"], commit_message_parser.parse("Alinoor #178 - remove unecessary new line"));
		assert.eql(["Pat"], commit_message_parser.parse("pat: removed debug info in footer"));
    }
};
