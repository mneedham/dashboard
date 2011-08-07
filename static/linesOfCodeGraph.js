var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var git = new RGraph.Line('git', options.code, options.unitTests, options.integrationTests, options.functionalTests);
	    git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.bottom', 125);
	    git.Set('chart.gutter.left', 5);
	    git.Set('chart.gutter.right', 45);
     	git.Set('chart.text.angle', 90);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 3);
		git.Set('chart.key.position', 'gutter');
	    git.Set('chart.key', ["Code", "Unit Tests", "Integration Tests", "Functional Tests"]);
	    git.Set('chart.labels', generateLabels(options.times, 10));
	    git.Draw();		
	}
	
	function generateLabels(times, numberToShow) {
		var labels = [0];
		for(var i=1; i <= numberToShow; i++) {
			labels.push(Math.round((times.length / numberToShow) * i)-1);
		}
		
		return _(labels).map(function(pos) { return dateify(times[pos])});
	}
	
	function dateify(unixTimeStamp) {
		return new Date(unixTimeStamp*1000).toString('MMMM dd, yyyy');
	}
	
	function drawRatioGraph(options) {
		var ratio=  _(_.zip(options.code, options.unitTests, options.integrationTests, options.functionalTests)).map(function(values) { return (values[1] + values[2] + values[3]) / values[0]; });
		
		var git = new RGraph.Line('git-ratio', ratio);
	    git.Set('chart.title', 'Test to Code Ratio');
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 3);
	    git.Draw();		
	}	
	
	function init() {
		var linesOfCode = [], linesOfUnitTests = [], linesOfIntegrationTests = [], linesOfFunctionalTests = [], times = [];
	    $.getJSON('/git-stats', function(data) {
	      $.each(data, function(key, val) {
	        linesOfCode.push(val["main"]);
	        linesOfUnitTests.push(val["unit"]);
	        linesOfIntegrationTests.push(val["integration"]);
	        linesOfFunctionalTests.push(val["functional"]);
	        times.push(val["time"]);
	      });

		  drawGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, functionalTests : linesOfFunctionalTests, times : times });
		  drawRatioGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, functionalTests : linesOfFunctionalTests, times : times });		
	    });

	}
	var obj = {
		init : init
	};
	return obj;
}