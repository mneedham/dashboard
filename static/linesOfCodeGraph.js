var CommitsGraphs = function() {
	function drawGraph(container, commits, ticks) {
	      $.jqplot(container, [commits], {
	        seriesDefaults:{
	          renderer:$.jqplot.BarRenderer, pointLabels:{show:true, stackedValue: true},
	          rendererOptions: {fillToZero: true}
	        }, 
	        axes : {
	          yaxis : { padMin : 0, pad: 1.1, min:0, tickOptions:{ formatString:'%.0f' } },
	          xaxis : { padMin : 0, ticks : ticks, renderer: $.jqplot.CategoryAxisRenderer }	  
	        }
	      });		
	}
	
	function nonZeroEntries(data) {
		var filtered = {};	 
	    for(var date in data) {
	      if(data[date] > 0) filtered[date] = data[date];	  	
	    }
	    return filtered;		
	}
	
	function init() {
		$.getJSON('/git/commits/by-time', function(data) {
	      var filtered = nonZeroEntries(data);
	      var commits = _(filtered).map(function(numberOfCommits) { return numberOfCommits; });
	      var ticks = _(filtered).map(function(_, time) { return time.toString().match(/(\d\d:00)(?=.*GMT)/g).join("-"); });
		  drawGraph('commits-by-time', commits, ticks);	
	    });

	    $.getJSON('/git/commits/by-day', function(data) {
	      var commits = _(data).map(function(numberOfCommits) { return numberOfCommits; });
	      var ticks = _(data).map(function(_, day) { return day; })	
		  drawGraph('commits-by-day', commits, ticks);
	    });
	}
	
	return { init : init };
}

var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var git = new RGraph.Line('git', options.code, options.unitTests, options.integrationTests, options.functionalTests, options.systemTests, options.sharedTestCode);
		git.Set('chart.title', 'Lines of code');
		git.Set('chart.xticks', 10);
	    git.Set('chart.gutter.top', 45);
	    git.Set('chart.gutter.bottom', 125);
	    git.Set('chart.gutter.left', 50);
	    git.Set('chart.gutter.right', 45);
     	git.Set('chart.text.angle', 90);
	    git.Set('chart.shadow', true);
	    git.Set('chart.linewidth', 1);
		git.Set('chart.key.position', 'graph');
		git.Set('chart.key.halign', 'left');
	    git.Set('chart.key', ["Code", "Unit Tests", "Integration Tests", "Functional Tests", "System Tests", "Shared",]);
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
		var ratio=  _(_.zip(options.code, options.unitTests, options.integrationTests, options.functionalTests, options.systemTests, options.sharedTestCode)).map(function(values) { 
			return (values[1].toInt() + values[2].toInt() + values[3].toInt() + values[4].toInt() + values[5].toInt()) / values[0].toInt(); 
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
		var linesOfCode = [], linesOfUnitTests = [], linesOfIntegrationTests = [], linesOfFunctionalTests = [], linesOfSystemTests = [], linesOfSharedTestCode = [], times = [];
	    $.getJSON('/git/commits', function(data) {
	      $.each(data, function(key, val) {
	        linesOfCode.push(val["main"]);
	        linesOfUnitTests.push(val["unit"]);
	        linesOfIntegrationTests.push(val["integration"]);
	        linesOfFunctionalTests.push(val["functional"]);
			linesOfSystemTests.push(val["system"]);		
	        linesOfSharedTestCode.push(val["shared"]);	
	        times.push(val["time"]);
	      });

		  drawGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, 
					  functionalTests : linesOfFunctionalTests, systemTests : linesOfSystemTests, sharedTestCode : linesOfSharedTestCode, times : times });
		  drawRatioGraph({ code : linesOfCode, unitTests : linesOfUnitTests, integrationTests : linesOfIntegrationTests, 
			               functionalTests : linesOfFunctionalTests, systemTests : linesOfSystemTests,  sharedTestCode : linesOfSharedTestCode,  times : times });		
	    });
	
		$.getJSON('/go/show', function(data) {
			drawGoGraph(data);
		});

	}
	
	var obj = { init : init	};
	return obj;
}