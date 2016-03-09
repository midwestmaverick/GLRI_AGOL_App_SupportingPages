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

var range = function(max){
	var outRange = [];
	for(i = 0; i < max; i++){
		outRange.push(i);
	}
	return(outRange);
}

var randomColor = function() {
	var r = Math.round(Math.random() * 250);
	var g = Math.round(Math.random() * 250);
	var b = Math.round(Math.random() * 250);
	return "rgb("+r+","+g+","+b+")";
}

var appendSVG = function(data,elementId,chartTitle){
	var columns = d3.keys(data[0]).filter(function(key) { return key !== "row" && key !== "error"; });
	var er = false;
	data.forEach(function(d) {
		d.columns = columns.map(function(name) { 
			if(+d[name][1] > 0){
				er=true;
			}
			return {name: name, value: +d[name][0], error: +d[name][1]}; 
		});
	});
	//console.log(er);
	
	var dataLength = data.length * (data[0].columns.length+2);
	outputData = data;
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
		width = d3.max([dataLength*12, 960]) - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
		
	var svg = d3.select(elementId)
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x0 = d3.scale.ordinal().rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear().range([height, 0]);

	var color = d3.scale.ordinal().range(['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928']);

	var xAxis = d3.svg.axis()
		.scale(x0)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format(".2s"));
	
	var rows = data.map(function(d) { return d.row; });
	x0.domain(rows);
	x1.domain(columns).rangeRoundBands([0, x0.rangeBand()]);
	y.domain([0, d3.max(data, function(d) { return d3.max(d.columns, function(d) { return d.value + (d.value * (0.01 * d.error)); }); })]);

	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis)
		.selectAll(".tick text")
		.call(wrap, x0.rangeBand());
	
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(chartTitle);

	var row = svg.selectAll(".row")
		.data(data)
		.enter()
		.append("g")
		.attr("class", "row")
		.attr("transform", function(d) { return "translate(" + x0(d.row) + ",0)"; });
	
	row.selectAll("rect")
		.data(function(d) { return d.columns; })
		.enter()
		.append("rect")
		.attr("width", x1.rangeBand())
		.attr("x", function(d) { return x1(d.name); })
		.attr("y", function(d) { return y(d.value); })
		.attr("height", function(d) {return height - y(d.value); })
		.style("fill", function(d) { return color(d.name); });
	

	row.selectAll("line")
		.data(function(d) {return d.columns;})
		.enter()
		.append("line")
		.attr("x1", function(d) { return x1(d.name)+(x1.rangeBand()*0.5); })
		.attr("x2", function(d) { return x1(d.name)+(x1.rangeBand()*0.5); })
		.attr("y1", function(d) { return y(d.value-((d.error*0.01)*d.value)); })
		.attr("y2", function(d) { return y(d.value+((d.error*0.01)*d.value)); })
		.style("stroke-dasharray","2,1");

	row.selectAll(".row")
		.data(function(d) {return d.columns;})
		.enter()
		.append("line")
		.attr("x1", function(d) { return x1(d.name)+(x1.rangeBand()*0.4); })
		.attr("x2", function(d) { return x1(d.name)+(x1.rangeBand()*0.6); })
		.attr("y1", function(d) { return y(d.value+((d.error*0.01)*d.value)); })
		.attr("y2", function(d) { return y(d.value+((d.error*0.01)*d.value)); })
		.style("stroke-dasharray","2,1");

	row.selectAll(".row")
		.data(function(d) {return d.columns;})
		.enter()
		.append("line")
		.attr("x1", function(d) { return x1(d.name)+(x1.rangeBand()*0.4); })
		.attr("x2", function(d) { return x1(d.name)+(x1.rangeBand()*0.6); })
		.attr("y1", function(d) { return y(d.value-((d.error*0.01)*d.value)); })
		.attr("y2", function(d) { return y(d.value-((d.error*0.01)*d.value)); })
		.style("stroke-dasharray","2,1");

	var legend = svg.selectAll(".legend")
		.data(columns.slice().reverse())
		.enter()
		.append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) { return d; });
		
	svg.append("text")
		.attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text(chartTitle);
}



