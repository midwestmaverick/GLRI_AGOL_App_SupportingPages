var xAxis, yAxis, x, y, r, margin, zoomBeh;

		
function inRange(i,r){
	return i > d3.min(r) && i < d3.max(r);
}

function transform(xf,yf) {
	return "translate(" + x(xf) + "," + y(yf) + ")";
}

function initChart(data){
	//get chart container dimensions
	margin = { top: 10, right: 10, bottom: 40, left: 56 },
			outerWidth = $("#chartContainer").width(),
			outerHeight = $("#chartContainer").height(),
			width = outerWidth - margin.left - margin.right,
			height = outerHeight - margin.top - margin.bottom;	

	//define scales outside of function so they can be used universally
	x = d3.scale.linear()
			.range([0, width]).nice();

	y = d3.scale.linear()
			.range([height, 0]).nice();
			
	r = d3.scale.linear()
			.range([2,10]).nice();
	
	
	var lds = getLyrs();
	xf = lds.X.valField;
	yf = lds.Y.valField;
	
	var xCat = lds.X.title,
			yCat = lds.Y.title,
			rCat = "PctFor2008";
			
  var xMax = d3.max(data, function(d) { return d[xf]; }) * 1.05,
      xMin = d3.min(data, function(d) { return d[xf]; }),
			xMin = xMin - (0.05 * (xMax - xMin));
			
  var yMax = d3.max(data, function(d) { return d[yf]; }) * 1.05,
      yMin = d3.min(data, function(d) { return d[yf]; }),
			yMin = yMin - (0.05 * (yMax - yMin));
			
  var fMax = d3.max(data, function(d) { return d[rCat]; }),
      fMin = d3.min(data, function(d) { return d[rCat]; }),
      fMin = fMin > 0 ? 0 : fMin;
			
  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);
	r.domain([fMin, fMax])

  xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .tickSize(-height);

  yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .tickSize(-width);

  var color = d3.scale.category10();
			
  zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", function(d) {
				zoom();
				renderMapBasedOnChart();
				updateAllCounters();
			});

  var svg = d3.select("#chartContainer")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
			.attr("id","chartInfo")
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
			.attr("id","xAxisLabel")
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
			.attr("id","yAxisLabel")
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
      .attr("r", function(d) { return r(d.PctFor2008) })
      .attr("transform", function(d) {return transform(d[xf],d[yf])})
      .style("fill", "#006d2c")
      .on("mouseover", function(d){
				highlightPoints(d[featureId]);
			})
      .on("mouseout", function(d){
				unhighlightPoints();
			});
			
		
	function zoom() {
		d3.select(".x.axis").call(xAxis);
		d3.select(".y.axis").call(yAxis);
		var lds = getLyrs();
		d3.selectAll(".dot").attr("transform", function(d) {return transform(d[lds.X.valField],d[lds.Y.valField])});	
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


function updateChart(){
	
};