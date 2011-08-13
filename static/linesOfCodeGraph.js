var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var git = new RGraph.Line('git', options.code, options.unitTests, options.integrationTests, options.functionalTests);
		git.Set('chart.title', 'Lines of code');
	    git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.bottom', 125);
	    git.Set('chart.gutter.left', 50);
	    git.Set('chart.gutter.right', 45);
     	git.Set('chart.text.angle', 90);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 1);
		git.Set('chart.key.position', 'graph');
		git.Set('chart.key.halign', 'left');
	    git.Set('chart.key', ["Code", "Unit Tests", "Integration Tests", "Functional Tests"]);
	    git.Set('chart.labels', generateLabels(options.times, 10));
	    git.Draw();		
	}
	
	function generateLabels(times, numberToShow) {
		var labels = [0];
		for(var i=1; i <= numberToShow; i++) {
			labels.push(Math.round((times.length / numberToShow) * i)-1);
		}
		
		function dateify(unixTimeStamp) {
			return new Date(unixTimeStamp*1000).toString('MMMM dd, yyyy');
		}
		
		return _(labels).map(function(pos) { return dateify(times[pos])});
	}
	
	if(String.prototype.toInt !== "function") {
		String.prototype.toInt = function() {
	  		return parseInt(parseFloat(this));
		}
	}
	
	function drawRatioGraph(options) {
		var ratio=  _(_.zip(options.code, options.unitTests, options.integrationTests, options.functionalTests)).map(function(values) { 
			return (values[1].toInt() + values[2].toInt() + values[3].toInt()) / values[0].toInt(); 
		});
		
		var git = new RGraph.Line('git-ratio', ratio);
	    git.Set('chart.title', 'Test to Code Ratio');		
		git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.bottom', 125);
	    git.Set('chart.gutter.left', 50);
		git.Set('chart.text.angle', 90);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 1);
		git.Set('chart.labels', generateLabels(options.times, 10));
		
	    git.Draw();		
	}
	
	function drawGoGraph(buildTimes) {		
		var git = new RGraph.Line('go', _(buildTimes).map(function(buildTime) { return  (new Date(buildTime.end) - new Date(buildTime.start)) / 1000 }).filter(function(diff) { return diff > 0; }));
	    git.Set('chart.title', 'Build Times');		
		git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.bottom', 125);
	    git.Set('chart.gutter.left', 50);
		git.Set('chart.text.angle', 90);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 1);
		
	    git.Draw();		
	}		
	
	function init() {
		var linesOfCode = [], linesOfUnitTests = [], linesOfIntegrationTests = [], linesOfFunctionalTests = [], times = [];
	    $.getJSON('/git/show', function(data) {
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
	
		$.getJSON('/go/show', function(data) {
			drawGoGraph(data);
		});
	}
	
	var obj = { init : init	};
	return obj;
}