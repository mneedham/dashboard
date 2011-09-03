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
		var code = _(options.data).map(function(obj, idx) { return obj.main });
		var unit = _(options.data).map(function(obj, idx) { return obj.unit });
		var functional = _(options.data).map(function(obj, idx) { return obj.functional });
		var integration = _(options.data).map(function(obj, idx) { return obj.integration });
		var system = _(options.data).map(function(obj, idx) { return obj.system });
		
	    $.jqplot('git', [code, unit, functional, integration, system], {
	      title: 'Lines of code', 
		  series:[{label:'Code'}, {label:'Unit Tests'}, {label:'Functional Tests'}, {label:'Integration Tests'}, {label:'System Tests'}],	
		  legend: { show: true, location : "nw" },
	      seriesDefaults: { showMarker:false, lineWidth: 1},
	      axes:{ yaxis:{padMin : 0, pad: 1.1, min:0, max : _(functional).max(), tickOptions:{ formatString:'%.0f' } }, xaxis : {  padMin : 0, pad:0} }
	    });			
	}
	
	function drawRatioGraph(options) {
		var code = _(options.data).map(function(obj, idx) { return obj.main });
		var unit = _(options.data).map(function(obj, idx) { return obj.unit });
		var functional = _(options.data).map(function(obj, idx) { return obj.functional });
		var integration = _(options.data).map(function(obj, idx) { return obj.integration });
		var system = _(options.data).map(function(obj, idx) { return obj.system });		
		
		var ratio =  _(_.zip(code, unit, integration, functional, system)).map(function(values) { 
			return (values[1].toInt() + values[2].toInt() + values[3].toInt() + values[4].toInt()) / values[0].toInt(); 
		});
			
	    $.jqplot('git-ratio', [ratio], {
	      title: 'Lines of code to test ratio', 
	      seriesDefaults: { showMarker:false, lineWidth: 1},
	      axes:{ yaxis:{padMin : 0, pad: 1.1, min:0, tickOptions:{ formatString:'%.0f' } }, xaxis : {  padMin : 0, pad:0} }
	    });				
	}	
	
	if(String.prototype.toInt !== "function") {
		String.prototype.toInt = function() {
	  		return parseInt(parseFloat(this));
		}
	}
		
	function drawGoGraph(data) {		
	    var buildTimes = _(data).map(function(buildTime) { return  (new Date(buildTime.end) - new Date(buildTime.start)) / 1000 }).filter(function(diff) { return diff > 0; });
			
	    $.jqplot('go', [buildTimes], {
	      title: 'Build Times', 
	      seriesDefaults: { showMarker:false, lineWidth: 1},
	      axes:{ yaxis:{padMin : 0, pad: 1.1, min:0, tickOptions:{ formatString:'%.0f' } }, xaxis : {  padMin : 0, pad:0} }
	    });	
	}	
	
	
	function init() {
	    $.getJSON('/git/commits', function(data) {
		  drawGraph({ data :data });
		  drawRatioGraph({ data:data });		
	    });
	
		$.getJSON('/go/show', function(data) { drawGoGraph(data); });
	}
	
	var obj = { init : init	};
	return obj;
}