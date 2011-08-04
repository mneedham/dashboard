var LinesOfCodeGraph = function() {
	function init() {
		var linesOfCode = [], linesOfUnitTests = [], linesOfIntegrationTests = [], linesOfFunctionalTests = [];
	    $.getJSON('/git-stats', function(data) {
	      $.each(data, function(key, val) {
	        linesOfCode.push(val["main"]);
	        linesOfUnitTests.push(val["unit"]);
	        linesOfIntegrationTests.push(val["integration"]);
	        linesOfFunctionalTests.push(val["functional"]);
	      });

	      var git = new RGraph.Line('git', linesOfCode, linesOfUnitTests, linesOfIntegrationTests, linesOfFunctionalTests);
	      git.Set('chart.hmargin', 15);
	      git.Set('chart.tickmarks', 'endsquare');
	      git.Set('chart.title', 'Lines of code');
	      git.Set('chart.gutter.top', 45);
	      git.Set('chart.gutter.left', 5);
	      git.Set('chart.gutter.right', 45);
	      git.Set('chart.shadow', true);
	      git.Set('chart.linewidth', 3);
	      git.Set('chart.key', ["Code", "Unit Tests", "Integration Tests", "Functional Tests"])
	      git.Draw();
	    });
	}
	var obj = {
		init : init
	};
	return obj;
}