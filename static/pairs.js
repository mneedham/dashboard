function PairingGrid() {
	var grid = "<table>";
	function addHeading(columns) {
		grid += "<tr>";
    	$.each(columns, function(_, column) {
			grid += "<th>" + column + "</th>";
		});
		grid += "</tr>"
	}
	
    function addRow(values) {
      var row = "<tr>";
      $.each(values, function(_, value) {
        row += "<td align='center'>" + value + "</td>";
      });
      row += "</tr>";
	
	  grid += row;
    }
	
	function draw() {
		return grid + "</table>";
	}
	
	return {
		addHeading : addHeading, addRow : addRow, draw : draw
	};
}

function Pairs(data) {
	var pairs = parsePairs();
    var totalTimesPaired = _.reduce(pairs, function(acc, options){ return acc + options.timesPaired; }, 0);
    var totalCommits = _.reduce(pairs, function(acc, options){ return acc + options.numberOfCommits; }, 0);	
    var totals = { timesPaired : totalTimesPaired, commits : totalCommits, commitsPerPairing : (totalCommits/totalTimesPaired).toFixed(2) };
	
    function parsePairs() {
      var pairs = {};
      $.each(data, function(key, val) {
        $.each(val, function(person, numberOfCommits) {
          if(!pairs[person]) {
            pairs[person] = { timesPaired : 0, numberOfCommits : 0, lastPaired : "0" };
          }

          if(new Date(pairs[person]["lastPaired"]) < new Date(key)) {
            pairs[person]["lastPaired"] = key;
          }

          pairs[person]["timesPaired"] += 1;
          pairs[person]["numberOfCommits"] += numberOfCommits;
        });              		
      }); 
      return pairs;
    }

    function mostPairings() {
      var maxPairCount = 1;
      $.each(pairs, function(person, options) {
        if(options.timesPaired > maxPairCount) {
           maxPairCount = options.timesPaired;
        }
      });
      return maxPairCount;
    }

    return { grid : pairs, mostPairings : mostPairings, totals : totals
	};	
}