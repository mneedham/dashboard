var LinesOfCodeGraph = function() {
	function drawGraph(options) {
		// var code = _(options.data).map(function(obj, idx) { return obj.main });
		// 		var unit = _(options.data).map(function(obj, idx) { return obj.unit });
		var functional = _(options.data).map(function(obj, idx) { return [new Date(obj.time*1000), obj.functional] });
		// console.log(functional);
		// functional = [["23 May 2011", 4], ["25 May 2011", 5],  ["25 May 2011", 5],  ["25 May 2011", 5]]
		// 	// var integration = _(options.data).map(function(obj, idx) { return obj.integration });
		// 	// var system = _(options.data).map(function(obj, idx) { return obj.system });
		// 	
		//  var line1=[['23-May-08', 578.55], ['20-Jun-08', 566.5], ['25-Jul-08', 480.88], ['22-Aug-08', 509.84],
		//       ['26-Sep-08', 454.13], ['24-Oct-08', 379.75], ['21-Nov-08', 303], ['26-Dec-08', 308.56],
		//       ['23-Jan-09', 299.14], ['20-Feb-09', 346.51], ['20-Mar-09', 325.99], ['24-Apr-09', 386.15]];
		
	  var plot1 = $.jqplot('git', [functional], {
	      title:'Data Point Highlighting',
	      axes:{
	        xaxis:{
	          renderer:$.jqplot.DateAxisRenderer,  padMin : 0, pad:0,
	          tickOptions:{
	            formatString:'%b&nbsp;%#d'
	          },  autoscale :true
	        },
	        yaxis:{
	          tickOptions:{
	            formatString:'%.0f'
	            }, max :_(_(functional).map(function(arr) { return arr[1];})).max(), padMin : 0, pad: 1.1, min:0, 
	        }
	      },
	      highlighter: {
	        show: true,
	        sizeAdjust: 7.5, showMarker: false,
	      },
	      cursor: {
	        show: false
	      }
	  });		
		
		  // 	    $.jqplot('git', [functional], {
		  // 	      title: 'Lines of code', 
		  // series:[{label:'Code'}, {label:'Unit Tests'}, {label:'Functional Tests'}, {label:'Integration Tests'}, {label:'System Tests'}],	
		  // legend: { show: true, location : "nw" },
		  // 	      seriesDefaults: { showMarker:false, lineWidth: 1},
		  // 	      axes:{ yaxis:{padMin : 0, pad: 1.1, min:0, max : _(functional).max(), tickOptions:{ formatString:'%.0f' } }, xaxis : { renderer: $.jqplot.DateAxisRenderer,  padMin : 0, pad:0} }
		  // 	    });			
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