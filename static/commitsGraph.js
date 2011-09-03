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
		  var failedBuilds = [0,0,0,0,0,0,0,0,1,3,6,21,15,4,15,8,37,27,11,13,0,0,0,0];	

	      var filteredCommits = {}, filteredBuilds = [], i = 0;
		  for(var date in data) {
		    if(data[date] > 0) {
			  filteredCommits[date] = data[date], filteredBuilds.push(failedBuilds[i]);
		    }	
		    i++;
		  }

	      var commits = _(filteredCommits).map(function(numberOfCommits) { return numberOfCommits; });
	      var ticks = _(filteredCommits).map(function(_, time) { return time.toString().match(/(\d\d:00)(?=.*GMT)/g).join("-"); });


		  $.jqplot('commits-by-time', [commits, filteredBuilds], {
			  title : "Failed builds vs number of commits",
		      seriesDefaults:{
		         pointLabels:{show:true, stackedValue: true},
		        rendererOptions: {fillToZero: true}
		      }, 
		      series : [{ renderer:$.jqplot.BarRenderer, yaxis: "yaxis"}, { renderer: $.jqplot.LineRenderer, yaxis : "y2axis"}],
		      axes : {
		        yaxis : { padMin : 0, pad: 1.1, min:0, tickOptions:{ formatString:'%.0f' } },
		        xaxis : { padMin : 0,  renderer: $.jqplot.CategoryAxisRenderer, ticks:ticks },
		        y2axis : { padMin : 0, pad: 1.1, min:0, tickOptions:{ formatString:'%.0f' } },  
		      }
		    });
	    });
	
	    $.getJSON('/git/most-changed-files', function(data) {
	      var commits = _(data).map(function(obj) { return obj.times; });
	      $.jqplot('most-changed-files', [commits], {
	        seriesDefaults: { showMarker:false, lineWidth: 1}, highlighter: { show: true, sizeAdjust: 7.5, showMarker: false },
			axes : {
			  yaxis : { padMin : 0, pad: 1.1, min:0, max:127, tickOptions:{ formatString:'%.0f' } },
			  xaxis : { padMin : 0,  renderer: $.jqplot.CategoryAxisRenderer }	  
			}
	      });	  
	    });
	  
	    $.getJSON('/git/commits/by-day', function(data) {
	      var commits = _(data).map(function(numberOfCommits) { return numberOfCommits; });
	      var ticks = _(data).map(function(_, day) { return day; });	
		  drawGraph('commits-by-day', commits, ticks);
	    });
	}
	
	return { init : init };
}