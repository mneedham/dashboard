var assert = require('assert'), commit_message_parser = require('commit_message_parser');

module.exports = {
    'parse()': function(){
        assert.eql(["Ken", "Alex"], commit_message_parser.parse("Ken/Alex #266 added empty authors column so that subjects appear in 3rd column"));
        assert.eql(["Alinoor", "Mark"], commit_message_parser.parse("alinoor/mark #380 more stuff this time for chapter title"));
        assert.eql(["Mark", "Suzuki"], commit_message_parser.parse("mark,suzuki #232 fix merge"));
	    assert.eql(["Pat", "Sebastian"], commit_message_parser.parse("pat, sebastian: removing unnecessary line in dev properties."));
	    assert.eql(["Charles", "Mark"], commit_message_parser.parse("charles/mark: adios to play, hello scalatra"));
    },
    'pairs()' : function() {
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]]}, commit_message_parser.pairs([{message:"Alex/Charles #0 Added functional ML test", date:"Fri Jun 03 2011"}]));  
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"], ["Alinoor", "Mark"]]}, 
				  commit_message_parser.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"alinoor/mark #380 more stuff",date:"Fri Jun 03 2011"}]));  
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]], "Mon Jun 06 2011" : [["Pat", "Liz"]]}, 
				  commit_message_parser.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"pat, liz: removing stuff",date:"Mon Jun 06 2011"}]));
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]]}, 
				  commit_message_parser.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Karl: styled subheading h3 for #519",date:"Fri Jun 03 2011"}]));
			   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]]}, 
						  commit_message_parser.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Alex/Charles: some other shizzle",date:"Fri Jun 03 2011"}]));				
	},
	'hasPair()' : function() {
		assert.eql(false, commit_message_parser.hasPair("Merge branch 'master' of segblogr0065:core"));
	    assert.eql(false, commit_message_parser.hasPair("Karl: styled subheading h3 for #519"));
	    assert.eql(false, commit_message_parser.hasPair("Alinoor #178 - remove unecessary new line"));
		assert.eql(false, commit_message_parser.hasPair("pat: removed debug info in footer"));
		assert.eql(false, commit_message_parser.hasPair("alinoor/mushtaq/mark: fix chef script for scala"))
	},
	'Pair()' : function() {
		assert.ok(commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Mark", person2 : "Pat"}));
		assert.ok(commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Pat", person2 : "Mark"}));
		assert.ok(!commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Liz", person2 : "Mark"}));
	},
	'unique()' : function() {
		var markAndPat = [commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"}), commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"})];
		var unique = markAndPat.unique()[0];
		console.log(unique);
		assert.ok(commit_message_parser.Pair({person1 : "Mark", person2 : "Pat"}).equals(unique));
	}
};
