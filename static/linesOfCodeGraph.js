var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		var unit = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.unit] });
		var functional = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.functional] });
		var code = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.main] });
		var integration = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.integration] });
		var xquery = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.xquery] });
		var jade = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.jade] });							
				
				
	  $.jqplot('git', [code, unit, functional, integration], {
	      title:'Lines of code', series:[{label:'Code'}, {label:'Unit Tests'}, {label:'Functional Tests'}, {label:'Integration Tests'}],
	      legend: { show: true, location : "nw" },
	      axes:{
	        xaxis:{ renderer:$.jqplot.DateAxisRenderer,  padMin : 0, pad:0, tickOptions:{ formatString:'%b&nbsp;%#d' },  autoscale :true },
	        yaxis:{ tickOptions:{formatString:'%.0f'}, max :_(_(functional).map(function(arr) { return arr[1];})).max(), padMin : 0, pad: 1.1, min:0 }
	      },
	      highlighter: { show: true, sizeAdjust: 7.5, showMarker: false },
	      cursor: { show: false }, 
	      seriesDefaults: { showMarker:false, lineWidth: 1},
	  });	
	
	  $.jqplot('git-code', [code, xquery, jade], {
	      title:'Lines of code', series:[{label:'Scala'}, {label:'Xquery'}, {label:'Jade'}],
	      legend: { show: true, location : "nw" },
	      axes:{
	        xaxis:{ renderer:$.jqplot.DateAxisRenderer,  padMin : 0, pad:0, tickOptions:{ formatString:'%b&nbsp;%#d' },  autoscale :true },
	        yaxis:{ tickOptions:{formatString:'%.0f'}, max :_(_(code).map(function(arr) { return arr[1];})).max(), padMin : 0, pad: 1.1, min:0 }
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
		var shared = _(options.data).map(function(obj) { return obj.shared });		

		
		var ratio =  _(_.zip(code, unit, integration, functional, system, shared)).map(function(values) { 
			return (values[1].toInt() + values[2].toInt() + values[3].toInt() + values[4].toInt() + values[5].toInt()) / values[0].toInt(); 
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