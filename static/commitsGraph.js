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
		$("#commits-by-day").html("");
		$("#commits-by-time").html("");
		
		
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