//get chart container dimensions
var margin = { top: 20, right: 20, bottom: 40, left: 56 },
		outerWidth = $("#chartContainer").width(),
		outerHeight = $("#chartContainer").height(),
		width = outerWidth - margin.left - margin.right - 304,
		height = outerHeight - margin.top - margin.bottom;	

//define scales outside of function so they can be used universally
var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();
		
var r = d3.scale.linear()
		.range([2,10]).nice();
		
function inRange(i,r){
	return i > d3.min(r) && i < d3.max(r);
}

function transform(d) {
	return "translate(" + x(d.x) + "," + y(d.y) + ")";
}

function initChart(data){
	console.log("init chart");
	var xCat = $("#lX").text(),
			yCat = $("#lY").text(),
			rCat = "fper";

  var xMax = d3.max(data, function(d) { return d.x; }) * 1.01,
      xMin = d3.min(data, function(d) { return d.x; }),
			xMin = xMin - (0.05 * (xMax - xMin));
			
  var yMax = d3.max(data, function(d) { return d.y; }) * 1.01,
      yMin = d3.min(data, function(d) { return d.y; }),
			yMin = yMin - (0.05 * (yMax - yMin));
			
  var fMax = d3.max(data, function(d) { return d[rCat]; }),
      fMin = d3.min(data, function(d) { return d[rCat]; }),
      fMin = fMin > 0 ? 0 : fMin;
			
  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);
	r.domain([fMin, fMax])

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height);

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width);

  var color = d3.scale.category10();
			
  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", function(d) {
				zoom();
				renderMapBasedOnChart();
			});

  var svg = d3.select("#chartContainer")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

  svg.append("rect")
			.attr("id","scatterRect")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", "1.0em")
      .style("text-anchor", "end")
      .text(yCat);

  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(data)
			.enter()
			.append("circle")
      .classed("dot", true)
      .attr("r", function(d) { return r(d.fper) })
      .attr("transform", transform)
      .style("fill", "#006d2c")
      .on("mouseover", function(d){
				highlightPoints(d.id);
			})
      .on("mouseout", function(d){
				unhighlightPoints();
			});
			
  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);
    svg.selectAll(".dot").attr("transform", transform);	
  }
	
	
/*
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 3.5)
      .attr("cx", width + 20)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  d3.select("input").on("click", change);

  function change() {
    xCat = "Carbs";
    xMax = d3.max(data, function(d) { return d[xCat]; });
    xMin = d3.min(data, function(d) { return d[xCat]; });

    zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

    var svg = d3.select("#scatter").transition();

    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
  }

*/
}
