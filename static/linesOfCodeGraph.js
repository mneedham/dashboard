var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var git = new RGraph.Line('git', options.code, options.unitTests, options.integrationTests, options.functionalTests);
	    git.Set('chart.hmargin', 15);
	    git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.left', 5);
	    git.Set('chart.gutter.right', 45);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 3);
		git.Set('chart.key.position', 'gutter');
	    git.Set('chart.key', ["Code", "Unit Tests", "Integration Tests", "Functional Tests"])
	    git.Draw();		
	}
	
	function drawRatioGraph(options) {
		var ratio=  _(_.zip(options.code, options.unitTests, options.integrationTests, options.functionalTests)).map(function(values) { return (values[1] + values[2] + values[3]) / values[0]; });
		
		var git = new RGraph.Line('git-ratio', ratio);
	    git.Set('chart.hmargin', 15);
	    git.Set('chart.tickmarks', 'endsquare');
	    git.Set('chart.title', 'Test to Code Ratio');
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 3);
	    git.Draw();		
	}	
	
	function init() {
		var linesOfCode = [], linesOfUnitTests = [], linesOfIntegrationTests = [], linesOfFunctionalTests = [];
	    $.getJSON('/git-stats', function(data) {
	      $.each(data, function(key, val) {
	        linesOfCode.push(val["main"]);
	        linesOfUnitTests.push(val["unit"]);
	        linesOfIntegrationTests.push(val["integration"]);
	        linesOfFunctionalTests.push(val["functional"]);
	      });

		  drawGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, functionalTests : linesOfFunctionalTests });
		  drawRatioGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, functionalTests : linesOfFunctionalTests });		
	    });

	}
	var obj = {
		init : init
	};
	return obj;
}