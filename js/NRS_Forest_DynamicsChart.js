function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

var initChart = function(data,chartTitle){
	//var data = {"Total Forest Area": 184425881, "Forest Area Change": 485694, "Area Cut": 2510836, "Area Cut or Disturbed": 4927335};
	var totForest = data["Total Forest Area"];
	delete data["Total Forest Area"];
	
	var cats = d3.keys(data);
	var vals = d3.values(data).map(function(d){return d/totForest});

	var mar = [40, 20, 40, 20],
		w = parseInt((document.getElementById("chartContainer").offsetWidth)-(mar[1] + mar[3])),
		h = parseInt((document.getElementById("chartContainer").offsetHeight)-(mar[0] + mar[2]));
	
	//var barWidth = (width / vals.length) * 0.9;
	var barPadding = 4;	
	
	var y = d3.scale.linear()
		.range([0, h])
		.domain([Math.min(d3.min(vals),0), d3.max(vals)]);

	//Create SVG element
	var svg = d3.select("#chartContainer")
		.append("svg")
		.attr("width", w+"px")
		.attr("height", h+"px")
		.attr("id","chart")
		.attr("style","margin:"+mar.join(" "));
	
	svg.selectAll("rect")
			   .data(vals)
			   .enter()
			   .append("rect")
			   .attr("x", function(d, i) {
			   		return i * (w / vals.length);
			   })
			   .attr("y", function(d) {
			   		return h - y(d);
			   })
			   .attr("width", w / vals.length - barPadding)
			   .attr("height", function(d) {
			   		return y(d);
			   });	
}

function updateChartValues(data){
	//var data = {"Total Forest Area": 36577335, "Forest Area Change": 59076, "Area Cut": 423028, "Area Cut or Disturbed": 1148795};
	var totForest = data["Total Forest Area"];
	delete data["Total Forest Area"];
			
	var cats = d3.keys(data);
	var vals = d3.values(data).map(function(d){return d/totForest});
		
	var mar = [40, 20, 40, 20],
		w = parseInt((document.getElementById("chartContainer").offsetWidth)-(mar[1] + mar[3])),
		h = parseInt((document.getElementById("chartContainer").offsetHeight)-(mar[0] + mar[2]));
	
	var y = d3.scale.linear()
		.range([0, h])
		.domain([Math.min(d3.min(vals),0), d3.max(vals)]);
	
	var svg = d3.select("#chart");
	svg.selectAll("rect")
	   .data(vals)
	   .attr("y",function(d) {
			return h - y(d);
	   })
	   .attr("height",function(d) {
		   return y(d);
	   })
}

function initTreeMap(){
	var margin = {top: 20, right: 0, bottom: 0, left: 0},
	width = parseInt((document.getElementById("chartContainer").offsetWidth)-(mar[1] + mar[3])),
	height = parseInt((document.getElementById("chartContainer").offsetHeight)-(mar[0] + mar[2]));
	
	formatNumber = d3.format(",d"),
	transitioning;

	/* create x and y scales */
	var x = d3.scale.linear()
	.domain([0, width])
	.range([0, width]);

	var y = d3.scale.linear()
	.domain([0, height])
	.range([0, height]);

	var treemap = d3.layout.treemap()
	.children(function(d, depth) { return depth ? null : d.children; })
	.sort(function(a, b) { return a.value - b.value; })
	.ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
	.round(false);

	/* create svg */
	var svg = d3.select("#chart").append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.bottom + margin.top)
	.style("margin-left", -margin.left + "px")
	.style("margin.right", -margin.right + "px")
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	.style("shape-rendering", "crispEdges");

	var grandparent = svg.append("g")
	.attr("class", "grandparent");

	grandparent.append("rect")
	.attr("y", -margin.top)
	.attr("width", width)
	.attr("height", margin.top);

	grandparent.append("text")
	.attr("x", 6)
	.attr("y", 6 - margin.top)
	.attr("dy", ".75em");	
}

function buildValueTree(data){
	var tree = {};
	
	
}