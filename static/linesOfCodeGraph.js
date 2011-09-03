function foo() {
	var timesFailed = [0, 1, 3, 6, 21, 15, 4, 15, 8, 37, 27, 11, 13, 0, 0, 0];
	var commits = [2,14,56,112,203,180,52,171,254,209,237,93,35,8,7,6];

	
	var plot2 = $.jqplot('chart2', [commits, timesFailed], { 
	      title:'Plot with Zooming and 3 Y Axes', 
	      seriesDefaults: {showMarker:false}, 
	      series:[ {yaxis:'yaxis', renderer:$.jqplot.BarRenderer},  {yaxis:'y2axis'}], 
	     
	      axesDefaults:{useSeriesColor: true}, 
	      axes:{
	          xaxis:{padMin : 0, pad: 0, min:0}, 
	          yaxis:{min:0,padMin : 0, pad: 0},  
	          y2axis: { min:0, padMin:0, pad:0,  tickOptions:{showGridline:false} }, 
	      } 
	  });
}

var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var unit = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.unit] });
		var functional = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.functional] });
		var code = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.main] });
		var integration = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.integration] });		
		var system = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.system] });		
		var shared = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.shared] });		
				
				
	  var plot1 = $.jqplot('git', [code, unit, functional, integration, system, shared ], {
	      title:'Lines of code', series:[{label:'Code'}, {label:'Unit Tests'}, {label:'Functional Tests'}, {label:'Integration Tests'}, {label:'System Tests'}, {label:'Shared Test Code'}],
	      legend: { show: true, location : "nw" },
	      axes:{
	        xaxis:{ renderer:$.jqplot.DateAxisRenderer,  padMin : 0, pad:0, tickOptions:{ formatString:'%b&nbsp;%#d' },  autoscale :true },
	        yaxis:{ tickOptions:{formatString:'%.0f'}, max :_(_(functional).map(function(arr) { return arr[1];})).max(), padMin : 0, pad: 1.1, min:0 }
	      },
	      highlighter: { show: true, sizeAdjust: 7.5, showMarker: false },
	      cursor: { show: false }, 
	      seriesDefaults: { showMarker:false, lineWidth: 1},
	  });		
		
	}
	
	function drawRatioGraph(options) {
		var code = _(options.data).map(function(obj) { return obj.main });
		var unit = _(options.data).map(function(obj) { return obj.unit });
		var functional = _(options.data).map(function(obj) { return obj.functional });
		var integration = _(options.data).map(function(obj) { return obj.integration });
		var system = _(options.data).map(function(obj) { return obj.system });		
		
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