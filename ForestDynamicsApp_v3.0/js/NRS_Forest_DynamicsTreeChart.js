var chartFields = [
	{"title":"Forest","parent":"Total Area"},
	{"title":"Nonforest","parent":"Total Area"},
	{"title":"Persistent Forest","field":"FF13anac","parent":"Forest"},
	{"title":"Persistent Nonforest","field":"NN13anac","parent":"Nonforest"},
	{"title":"Forest to Nonforest","field":"FN13anac","parent":"Forest"},
	{"title":"Nonforest to Forest","field":"NF13anac","parent":"Nonforest"}
];

function getChildren(par){
	return chartFields.filter(function(d){if(d.parent == par){return d}})
}

function buildTree(par,queryVals){
	var nodes = getChildren(par);
	var outObj = {
		"key":par
	};
	if(nodes.length == 0){
		outObj.value = queryVals[par];
	}else{
		outObj._children = [];
		nodes.forEach(function(n){
			outObj._children.push(buildTree(n.title,queryVals));
		});
		outObj.values = outObj._children;
		outObj.value = outObj._children.reduce(function(p,v){return p.value + v.value});
	}
	return outObj;
}

var valTree, queryVals, treeMap;
	
function lyrTreeSum(){
	queryDefs = [];
	outfields = [];
	var valFields = chartFields.filter(function(d){if(d.hasOwnProperty("field")){return d}});
	valFields.forEach(function(fld){
		var sumDef = new esri.tasks.StatisticDefinition();
			sumDef.statisticType = "sum";
			sumDef.onStatisticField = fld.field;
			sumDef.outStatisticFieldName = fld.title;
		queryDefs.push(sumDef);
		outfields.push(fld.title);
	});
					
	var fieldQuery = new esri.tasks.Query();				
		fieldQuery.outFields = outfields;
		fieldQuery.outStatistics = queryDefs;
		fieldQuery.geometry = map.extent;
		
		mapLayers[0].queryFeatures(fieldQuery,function(results){
			/*maxSum = d3.max(d3.values(results.features[0].attributes));
			if(maxSum > maxLyrSum){maxLyrSum = maxSum;}
			var chart = document.getElementById("chart");
			if(document.contains(chart)){
				updateChartValues(results.features[0].attributes);
			}else{
				initChart(results.features[0].attributes);
			}*/
			queryVals = results.features[0].attributes;
			valTree = buildTree("Total Area",queryVals);
			initTreeMap(valTree);
		});
}


	
function initTreeMap(data) {
	var container = document.getElementById("chartContainer");
	var protoChart = document.getElementById("chart");
	if(container.contains(protoChart) == true){
		protoChart.remove();
	}
	var chart = document.createElement("div");
	chart.setAttribute("id","chart");
	container.appendChild(chart);
	
	var margin = {top: 0, right: 0, bottom: 0, left: 0},
		width = parseInt((document.getElementById("chartContainer").offsetWidth)-(margin.top + margin.bottom)),
		height = parseInt((document.getElementById("chartContainer").offsetHeight)-(margin.top + margin.bottom)),
    transitioning;
	
	var opts = {
			title: "", // Title 
			rootname: "TOP", // Name of top-level entity in case data is an array
			format: ",d", // Format as per d3.format (https://github.com/mbostock/d3/wiki/Formatting)
			field: "data", // Object field to treat as data [default: data]
			width: width, // Width of SVG
			height: height, // Height of SVG
			margin: margin // Margin as per D3 convention
	}
	
  var root = data,
      formatNumber = d3.format(opts.format),
      rname = opts.rootname,
      margin = opts.margin,
      theight = 36 + 16;

  $('#chart').width(opts.width).height(opts.height);
  
  var color = d3.scale.category20c();
  
  var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);
  
  var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);
  
  var treemap = d3.layout.treemap()
      .children(function(d, depth) { return depth ? null : d._children; })
      .sort(function(a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);
  
  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin", margin.left + "px")
      
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

  initialize(root);
  layout(root);
  console.log(root);
  display(root);

  if (window.parent !== window) {
    var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
    window.parent.postMessage({height: myheight}, '*');
  }

  function initialize(root) {
    root.x = root.y = 0;
    root.dx = width;
    root.dy = height;
    root.depth = 0;
  }

  // Compute the treemap layout recursively such that each group of siblings
  // uses the same size (1×1) rather than the dimensions of the parent cell.
  // This optimizes the layout for the current zoom state. Note that a wrapper
  // object is created for the parent node for each group of siblings so that
  // the parent’s dimensions are not discarded as we recurse. Since each group
  // of sibling was laid out in 1×1, we must rescale to fit using absolute
  // coordinates. This lets us use a viewport to zoom.
  function layout(d) {
    if (d._children) {
      treemap.nodes({_children: d._children});
      d._children.forEach(function(c) {
        c.x = d.x + c.x * d.dx;
        c.y = d.y + c.y * d.dy;
        c.dx *= d.dx;
        c.dy *= d.dy;
        c.parent = d;
        layout(c);
      });
    }
  }

  function display(d) {
    grandparent
        .datum(d.parent)
        .on("click", transition)
      .select("text")
        .text(getName(d));

    var g1 = svg.insert("g", ".grandparent")
        .datum(d)
        .attr("class", "depth");

    var g = g1.selectAll("g")
        .data(d._children)
      .enter().append("g");

    g.filter(function(d) { return d._children; })
        .classed("children", true)
        .on("click", transition);

    var children = g.selectAll(".child")
        .data(function(d) { return d._children || [d]; })
      .enter().append("g");

    children.append("rect")
        .attr("class", "child")
        .call(rect)
      .append("title")
        .text(function(d) { return d.key + " (" + formatNumber(d.value) + ")"; });
    children.append("text")
        .attr("class", "ctext")
        .text(function(d) { return d.key; })
        .call(text2);

    g.append("rect")
        .attr("class", "parent")
        .call(rect);

    var t = g.append("text")
        .attr("class", "ptext")
        .attr("dy", ".75em")

    t.append("tspan")
        .text(function(d) { return d.key; });
    t.append("tspan")
        .attr("dy", "1.0em")
        .text(function(d) { return formatNumber(d.value); });
    t.call(text);

    g.selectAll("rect")
        .style("fill", function(d) { return color(d.key); });

    function transition(d) {
      if (transitioning || !d) return;
      transitioning = true;

      var g2 = display(d),
          t1 = g1.transition().duration(750),
          t2 = g2.transition().duration(750);

      // Update the domain only after entering new elements.
      x.domain([d.x, d.x + d.dx]);
      y.domain([d.y, d.y + d.dy]);

      // Enable anti-aliasing during the transition.
      svg.style("shape-rendering", null);

      // Draw child nodes on top of parent nodes.
      svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

      // Fade-in entering text.
      g2.selectAll("text").style("fill-opacity", 0);

      // Transition to the new view.
      t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
      t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
      t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
      t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
      t1.selectAll("rect").call(rect);
      t2.selectAll("rect").call(rect);

      // Remove the old node when the transition is finished.
      t1.remove().each("end", function() {
        svg.style("shape-rendering", "crispEdges");
        transitioning = false;
      });
    }

    treeMap = g;
  }

	function text(text) {
		text.selectAll("tspan")
				.attr("x", function(d) { return d.x + 6; })
		text.attr("x", function(d) { return d.x + 6; })
				.attr("y", function(d) { return d.y + 6; })
				.style("opacity", function(d) { return this.getComputedTextLength() < d.x + d.dx - d.x ? 1 : 0; });
	}

	function text2(text) {
		text.attr("x", function(d) { return d.x + d.dx - this.getComputedTextLength() - 6; })
				.attr("y", function(d) { return d.y + d.dy - 6; })
				.style("opacity", function(d) { return this.getComputedTextLength() < d.x + d.dx - d.x ? 1 : 0; });
	}

	function rect(rect) {
		rect.attr("x", function(d) { return d.x; })
				.attr("y", function(d) { return d.y; })
				.attr("width", function(d) { return d.x + d.dx - d.x; })
				.attr("height", function(d) { return d.y + d.dy - d.y; });
	}

	function getName(d) {
		return d.parent
				? getName(d.parent) + " / " + d.key + " (" + formatNumber(d.value) + ")"
				: d.key + " (" + formatNumber(d.value) + ")";
	}
}