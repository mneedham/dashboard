var assert = require('assert'), git = require('git');

Pair = git.Pair;

module.exports = {
    'parse()': function(){
        assert.ok(Pair({ person1: "Ken",     person2: "Alex"}).equals(git.parse("Ken/Alex #266 added empty authors column so that subjects appear in 3rd column")));
        assert.ok(Pair({ person1: "Alinoor", person2: "Mark"}).equals(git.parse("alinoor/mark #380 more stuff this time for chapter title")));
        assert.ok(Pair({ person1: "Mark",    person2: "Suzuki"}).equals(git.parse("mark,suzuki #232 fix merge")));
	    assert.ok(Pair({ person1: "Pat",     person2: "Sebastian"}).equals(git.parse("pat, sebastian: removing unnecessary line in dev properties.")));
	    assert.ok(Pair({ person1: "Charles", person2: "Mark"}).equals(git.parse("charles/mark: adios to play, hello scalatra")));
     	assert.ok(Pair({ person1: "Uday",    person2: "Alex"}).equals(git.parse("[Uday/Alex] #454 Added chapter title to the chapter page")));
        assert.ok(Pair({ person1: "Alex",    person2: "Uday"}).equals(git.parse("Alex / Uday #112 - Added XQuery update for Publication Title facet search rendering")));
        assert.ok(Pair({ person1: "Suzuki",  person2: "Alex"}).equals(git.parse("Suzuki/Alex	Updae ML key to new one as it was about to expire")));
        assert.ok(Pair({ person1: "Uday",    person2: "Duncan"}).equals(git.parse("uday{akumar}/duncan{the great} - #451 - hide and show-all authors in Javascript")));
		assert.ok(Pair({ person1: "Pat",     person2: "Dmc-chris"}).equals(git.parse("pat, dmc-chris: changed wording of publication title facet text.")));
		assert.ok(Pair({ person1: "Uday",     person2: "Suzuki"}).equals(git.parse("Uday:Suzuki #240: added reference heading and count")));
		
        // assert.ok(Pair({ person1: "Liz",  person2: "Rob"}).equals(git.parse("Liz Rob #539 Making query string parameter handling more generic")));

    },
    'pairs()' : function() {
	   var pairs = git.pairs([{message:"Alex/Charles #0 Added functional ML test", date:"Fri Jun 03 2011"}]);
	   assert.ok(pairs["Fri Jun 03 2011"][0].equals(Pair({person1 : "Alex", person2 : "Charles"})));
	
	   pairs = git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"alinoor/mark #380 more stuff",date:"Fri Jun 03 2011"}]);
	   assert.ok(pairs["Fri Jun 03 2011"][0].equals(Pair({person1 : "Alex", person2 : "Charles"})));	
	   assert.ok(pairs["Fri Jun 03 2011"][1].equals(Pair({person1 : "Alinoor", person2 : "Mark"})));	
	
	   pairs = git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"pat, liz: removing stuff",date:"Mon Jun 06 2011"}])
	   assert.ok(pairs["Fri Jun 03 2011"][0].equals(Pair({person1 : "Alex", person2 : "Charles"})));	
	   assert.ok(pairs["Mon Jun 06 2011"][0].equals(Pair({person1 : "Pat", person2 : "Liz"})));	

       pairs = git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Karl: styled subheading h3 for #519",date:"Fri Jun 03 2011"}]);
	   assert.ok(pairs["Fri Jun 03 2011"][0].equals(Pair({person1 : "Alex", person2 : "Charles"})));

       pairs = git.pairs([{message:"Alex/Charles #0 Added", date:"Fri Jun 03 2011"}, {message:"Alex/Charles: some other shizzle",date:"Fri Jun 03 2011"}]);
	   assert.ok(pairs["Fri Jun 03 2011"][0].equals(Pair({person1 : "Alex", person2 : "Charles"})));
	},
	'hasPair()' : function() {
		assert.eql(false, git.hasPair("Merge branch 'master' of segblogr0065:core"));
	    assert.eql(false, git.hasPair("Karl: styled subheading h3 for #519"));
	    assert.eql(false, git.hasPair("Alinoor #178 - remove unecessary new line"));
		assert.eql(false, git.hasPair("pat: removed debug info in footer"));
		assert.eql(false, git.hasPair("alinoor/mushtaq/mark: fix chef script for scala"));
		assert.eql(true, git.hasPair("[Uday/Alex] #454 Added chapter title to the chapter page"));
		assert.eql(true, git.hasPair("Suzuki/Alex	Updae ML key to new one as it was about to expire"));
		assert.eql(true, git.hasPair("uday{akumar}/duncan{the great} - #451 - hide and show-all authors in Javascript"));
		assert.eql(false, git.hasPair("Uday #FixingBuild Made enable/disable authenticate before all tests"))
		assert.eql(false, git.hasPair("Revert \"suzuki/mark: taking out the crazy xvfb stuff\""))
		assert.eql(true, git.hasPair("Uday:Suzuki #240: added reference heading and count"))
		// assert.eql(true, git.hasPair("Liz Rob #539 Making query string parameter handling more generic"))
		// assert.eql(true, git.hasPair("Rob Uday Simplified the search results object by passing different xmls for article and chapter"))
		// assert.eql(false, git.hasPair("Uday Removing code from search pages which are not used"))
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
