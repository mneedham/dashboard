var assert = require('assert'), git = require('git');

Pair = git.Pair;

module.exports = {
    'parse()': function(){
        assert.ok(Pair({ person1: "Ken", person2 : "Alex"}).equals(git.parse("Ken/Alex #266 added empty authors column so that subjects appear in 3rd column")));
        assert.ok(Pair({ person1: "Alinoor", person2 : "Mark"}).equals(git.parse("alinoor/mark #380 more stuff this time for chapter title")));
        assert.ok(Pair({ person1: "Mark", person2 :  "Suzuki"}).equals(git.parse("mark,suzuki #232 fix merge")));
	    assert.ok(Pair({ person1: "Pat", person2 : "Sebastian"}).equals(git.parse("pat, sebastian: removing unnecessary line in dev properties.")));
	    assert.ok(Pair({ person1: "Charles", person2 :  "Mark"}).equals(git.parse("charles/mark: adios to play, hello scalatra")));
    },
    'pairs()' : function() {
	   assert.eql({"Fri Jun 03 2011" : [Pair({person1 : "Alex", person2 : "Charles"})]}, git.pairs([{message:"Alex/Charles #0 Added functional ML test", date:"Fri Jun 03 2011"}]));  
	   assert.eql({"Fri Jun 03 2011" : [Pair({person1 : "Alex", person2 :  "Charles"}), Pair({person1:"Alinoor", person2: "Mark"})]}, 
				  git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"alinoor/mark #380 more stuff",date:"Fri Jun 03 2011"}]));  
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]], "Mon Jun 06 2011" : [["Pat", "Liz"]]}, 
				  git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"pat, liz: removing stuff",date:"Mon Jun 06 2011"}]));
	   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]]}, 
				  git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Karl: styled subheading h3 for #519",date:"Fri Jun 03 2011"}]));
			   assert.eql({"Fri Jun 03 2011" : [["Alex", "Charles"]]}, 
						  git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Alex/Charles: some other shizzle",date:"Fri Jun 03 2011"}]));				
	},
	'hasPair()' : function() {
		assert.eql(false, git.hasPair("Merge branch 'master' of segblogr0065:core"));
	    assert.eql(false, git.hasPair("Karl: styled subheading h3 for #519"));
	    assert.eql(false, git.hasPair("Alinoor #178 - remove unecessary new line"));
		assert.eql(false, git.hasPair("pat: removed debug info in footer"));
		assert.eql(false, git.hasPair("alinoor/mushtaq/mark: fix chef script for scala"))
	},
	'Pair()' : function() {
		assert.ok(Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Mark", person2 : "Pat"}));
		assert.ok(Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Pat", person2 : "Mark"}));
		assert.ok(!Pair({person1 : "Mark", person2 : "Pat"}).equals({person1 : "Liz", person2 : "Mark"}));
	},
	'unique()' : function() {
		var markAndPat = [git.Pair({person1 : "Mark", person2 : "Pat"}), git.Pair({person1 : "Mark", person2 : "Pat"})];
		var unique = markAndPat.unique()[0];
		assert.ok(git.Pair({person1 : "Mark", person2 : "Pat"}).equals(unique));
	}
};
