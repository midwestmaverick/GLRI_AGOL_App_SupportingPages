var map;
var initExtent;
var minPlots = 10;
var featureId = "FID";
var zoomRange = {min:5,max:10};
var aScale = d3.scale.linear();
var sumVals = {
	f:0,
	vx:0,
	vy:0,
	p:0
};
var numF = d3.format("0,000");
var perF = d3.format("0.3%");

//startupLayers
var sL = [5,2];

//scale values
function sV(obj,ld){
	return obj[ld.valField]*ld.scalingFactor;
}

//General utilities
function Timer(arg){
	this.msg = arg.callee.name;
	this.count = 1;
	this.start = function(){this.startTime = new Date().getTime();};
	this.stop = function(){console.log(this.msg + " stop " + this.count + ": " + parseInt(new Date().getTime() - this.startTime) + "ms");this.count++;};
}

function intF(n){
	return numF(parseInt(n));
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(col) {
    return "#" + componentToHex(col[0]) + componentToHex(col[1]) + componentToHex(col[2]);
}
function appendLyrScales(lyr){
	lyr.valScale = d3.scale.linear()
		.domain([0,1])
		.range(lyr.stops);
		
	lyr.sizeScale = d3.scale.linear()
		.domain(lyr.stops)
		.range(lyr.symbolSizes);
		
	lyr.colScale = d3.scale.linear()
		.domain(lyr.stops)
		.range(lyr.colors.map(function(d){return rgbToHex(d)}))
}
(function (){
	layerDefs.map(function(d){appendLyrScales(d)});
})();

d3.selection.prototype.first = function() {
  return d3.select(this[0][0]);
};
d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
};

function scaleSymbSize(size){
	return (size + (size * (map.getZoom() - map.getMinZoom())))*0.5;
}
function setColStops(l){
	var stops = [];
	l.stops.map(function(d,i){
		stops.push({"value":d,"color":new esri.Color(l.colors[i])});
	});
	return stops;
}
function genRange(start,stop,step){
	var a = new Array();
	for(var n = start; n <= stop; n+=step){a.push(n);}
	return a;
}
function getRange(array){
	return d3.max(array)-d3.min(array);
}
function getRangeArray(array){
	return [d3.min(array),d3.max(array)];
}
function getDataRangeArray(data){
	var min = 0;
	var max = 0;
	data.map(function(d){return d});
}
function getLyrs(){
		var lds = {"X":layerDefs.filter(function(d){return d.title == $("#lX").text()})[0], "Y":layerDefs.filter(function(d){return d.title == $("#lY").text()})[0]};
		return lds;
}
function highlightPoints(id){
	var timer = new Timer(arguments);
	timer.start();
	//console.log(id);
	var lds = getLyrs();
	d3.select("#map_layers").selectAll("circle").filter(function(d){
		if(this.getAttribute('data-'+featureId) == id){
			return this;
		}
	}).attr("id","mapHighlight");
	var cs = d3.selectAll(".dot").filter(function(d){return d[featureId] == id}).datum();

	d3.select(".objects").append("circle").attr("id","chartHighlight").attr('r',r(cs.PctFor2008)).attr("transform", transform(cs[lds.X.valField],cs[lds.Y.valField])).on("mouseout",unhighlightPoints);
	
	d3.select("#forestCounter").text(intF(cs.For2008));
	d3.select("#xCounter").text(intF(cs[lds.X.sumField]));
	d3.select("#yCounter").text(intF(cs[lds.Y.sumField]));
	d3.select("#xPer").text(perF(cs[lds.X.sumField]/cs.For2008));
	d3.select("#yPer").text(perF(cs[lds.Y.sumField]/cs.For2008));
	d3.select("#pCounter").text(numF(cs.Tot_plots));
	timer.stop();
}
function unhighlightPoints(){
	var timer = new Timer(arguments);
	timer.start();
	d3.select("#map_layers").selectAll("circle").attr("id","");
	d3.selectAll("#chartHighlight").remove();
	d3.select("#forestCounter").text(intF(sumVals.f));
	d3.select("#xCounter").text(intF(sumVals.vx));
	d3.select("#yCounter").text(intF(sumVals.vy));
	d3.select("#xPer").text(perF(sumVals.vx/sumVals.f));
	d3.select("#yPer").text(perF(sumVals.vy/sumVals.f));
	d3.select("#pCounter").text(numF(sumVals.p));
	timer.stop();
}	

function initMapHighlight(){
	var timer = new Timer(arguments);
	timer.start();
	$("circle", $("#map_layers")).mouseover(function(){
		highlightPoints(this.getAttribute("data-"+featureId));
	});
	$("circle", $("#map_layers")).mouseout(function(){unhighlightPoints();});
	timer.stop();
}

function counterRow(id,txt){
	d3.select("#counters")
		.append("tr")
		.append("td")
		.attr("width","70%")
		.append("text")
		.attr("id",id)
		.style({"font-size":"110%","text-align":"left"})
		.text(txt);
}

function counterData(id,txt){
	d3.select("#counters")
		.selectAll("tr")
		.last()
		.append("td")
		.attr("class","counterData")
		.attr("width","20%")
		.append("text")
		.attr("id",id)
		.style({"font-size":"110%"})
		.text(txt);
}

function addUnits(id,unit){
	d3.select(id).select(function(){return this.parentNode}).append("text").attr("class","counterUnits").text(unit);
}

function initCounters(){
	var timer = new Timer(arguments);
	timer.start();
	lds = getLyrs();
	counterRow("fcTitle","Forested Acres:");
	counterData("forestCounter",intF(sumVals.f));
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("xCTitle",lds.X.title+":");
	counterData("xCounter",intF(sumVals.vx));	
	counterRow("xCPerTitle","(% of Forest:)");
	counterData("xPer",perF(sumVals.vx/sumVals.f));
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("yCTitle",lds.Y.title+":");
	counterData("yCounter",intF(sumVals.vy));
	counterRow("xCPerTitle","(% of Forest:)");
	counterData("yPer",perF(sumVals.vy/sumVals.f));	
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("pTitle","FIA Plot count:");
	counterData("pCounter",sumVals.p);	
	
	addUnits("#forestCounter","ac");
	addUnits("#xCounter","ac");
	addUnits("#yCounter","ac");
	timer.stop();
}

function updateIntCounter(counterId,newVal){
	var timer = new Timer(arguments);
	timer.start();
	var oldVal = parseInt($(counterId).text().replace(/,/g,""));
	d3.select(counterId).transition().duration(1000).tween("text",function(d){
		var i = d3.interpolate(oldVal,newVal);
		return function(t) {
			d3.select(this).text(intF(i(t)));
		};
	});
	timer.stop();
}

function updatePerCounter(counterId,newVal){
	var timer = new Timer(arguments);
	timer.start();
	oldVal = parseFloat($(counterId).text().replace("(","").replace(")","").replace(/,/g,"")) * 0.01;
	d3.select(counterId).transition().duration(1000).tween("text",function(d){
		var i = d3.interpolate(oldVal,newVal);
		return function(t) {
			d3.select(this).text("("+perF(i(t))+")");
		};
	});
	timer.stop();
}

function sumVar(){
	var timer = new Timer(arguments);
	timer.start();
	var ext = map.extent;
	var lds = getLyrs()
	sumVals.f = 0;
	sumVals.vx = 0;
	sumVals.vy = 0;
	sumVals.p = 0;
	map.getLayer("lyrX").graphics.filter(function(g){
		return (inRange(g.geometry.x,[ext.xmin,ext.xmax])
						&& inRange(g.geometry.y,[ext.ymin,ext.ymax])
						&& inRange(g.attributes[lds.X.valField],x.domain())
						&& inRange(g.attributes[lds.Y.valField],y.domain()))
	}).map(function(c){
		sumVals.f += parseFloat(c.attributes.For2008);
		sumVals.vx += parseFloat(c.attributes[lds.X.sumField]);
		sumVals.vy += parseFloat(c.attributes[lds.Y.sumField]);
		sumVals.p += parseInt(c.attributes.Tot_plots);
	});
	return sumVals;
	timer.stop();
}

function updateAllCounters(vals){
	var timer = new Timer(arguments);
	timer.start();
	updateIntCounter("#forestCounter",parseInt(vals.f));
	updateIntCounter("#xCounter",parseInt(vals.vx));
	updateIntCounter("#yCounter",parseInt(vals.vy));
	updateIntCounter("#pCounter",parseInt(vals.p));
	if(vals.f == 0){
		vx = 0;
		vy = 0;
	}else{
		vx = vals.vx/vals.f;
		vy = vals.vy/vals.f;
	}
	updatePerCounter("#xPer",vx);
	updatePerCounter("#yPer",vy);
	/*updateAreaCircle("#forestCircle",vals.f);
	updateAreaCircle("#xCircle",vals.vx);
	updateAreaCircle("#yCircle",vals.vy);
	if(vals.vx > vals.vy){
		$("#xCircle").attr("class","circle2");
		$("#yCircle").attr("class","circle1");
	}else{
		$("#xCircle").attr("class","circle1");
		$("#yCircle").attr("class","circle2");
	}*/
	timer.stop();
}

//Map functions
function selectLayers(d){
	var timer = new Timer(arguments);
	timer.start();
	console.log("select:"+d)
	var l = $("#l"+d).text();
	var lds = getLyrs();
	var ml = map.getLayer("lyr"+d);
	var markerSym = new esri.symbol.SimpleMarkerSymbol();
	markerSym.outline.setWidth(0);
	markerSym.setSize(0);
	var r = new esri.renderer.SimpleRenderer(markerSym);   
	r.setColorInfo({
		field:lds[d].colField,
		stops:setColStops(lds[d])
	});
	ml.setRenderer(r);
	ml.redraw();
	customLegend($("#l"+d),lds[d].legendOrder);
	var dur = 1500;
	x.domain(getRangeArray(lds.X.minMax));
	y.domain(getRangeArray(lds.Y.minMax));
	d3.selectAll(".dot").transition().duration(200).delay(function(d,i){return i*0.5}).attr("transform",function(d){return transform(d[lds.X.valField],d[lds.Y.valField])});
	d3.select(".x.axis").transition().duration(1000).call(xAxis);
	d3.select(".y.axis").transition().duration(1000).call(yAxis);
	d3.select("#xAxisLabel").text(lds.X.title);
	d3.select("#yAxisLabel").text(lds.Y.title);
	zoomBeh.x(x);
	zoomBeh.y(y);
	d3.select("#xCTitle").text(lds.X.title+":");
	d3.select("#yCTitle").text(lds.Y.title+":");
	updateAllCounters(sumVar());
	scaleLegend();
	renderMapBasedOnChart();
	timer.stop();
}

function swipeTransform(){
	var w = $("#map").width();
	var h = $("#swipeHandle");
	var l = (h.position().left - h.parent().position().left) + (0.5 * h.width());
	try{
		var gl = $("#map_graphics_layer");
		var t = gl[0].transform.animVal.getItem(0).matrix;
		var e = (t.e + 3)*-1;
		var f = t.f * -1;
		var cp1 = d3.select("#clip1rect")
		.attr("width",l)
		.attr("transform","translate("+e+","+f+")");
		var cp2 = d3.select("#clip2rect")
		.attr("x",l)
		.attr("width",w-l)
		.attr("transform","translate("+e+","+f+")");
	}catch(e){}
}
function initSwipe(){
	var timer = new Timer(arguments);
	timer.start();
	var m = $("#map")[0];
	var w = $("#map").width();
	var h = m.offsetHeight;
	var l = $("#swipeHandle").position().left;
	
	var svg = d3.select("#map_gc");
	
	var clip1 = svg.append("svg:clipPath")
	.attr("id","gfx_clip1")
	.append("svg:rect")
	.attr("id","clip1rect")
	.attr("x","0")
	.attr("y","0")
	.attr("width",l)
	.attr("height","100%");
	
	var clip2 = svg.append("svg:clipPath")
	.attr("id","gfx_clip2")
	.append("svg:rect")
	.attr("id","clip2rect")
	.attr("x",l)
	.attr("y","0")
	.attr("width",w - l)
	.attr("height","100%");
	
	$('#swipeHandle').draggable({axis:"x",containment: "parent",drag:swipeTransform});
	
	$("#swipeZone").height($("#mapContainer").outerHeight());
	$("#swipeZone").offset({"top":$("#mapContainer").offset().top});
	
	$("#lyrX_layer").attr("clip-path","url(#gfx_clip1)");
	$("#lyrY_layer").attr("clip-path","url(#gfx_clip2)");
	timer.stop();
}

function layerMaker(data){
	//var timer = new Timer(arguments);
	//timer.start();
	var lyrs = {};
	var fsx = new esri.tasks.FeatureSet(data);
	var fcx = {
          layerDefinition: {
            "geometryType": "esriGeometryPoint",
            "fields": fsx.fields
					},
          featureSet: fsx
        };
	//timer.stop();//1
	lyrs.fx = new esri.layers.FeatureLayer(fcx,{
			mode:esri.layers.FeatureLayer.MODE_SNAPSHOT,
			id:"lyrX",
			dataAttributes:["FID"]
	});	
	//timer.stop();//2
	var fsy = new esri.tasks.FeatureSet(data);	
	var fcy = {
          layerDefinition: {
            "geometryType": "esriGeometryPoint",
            "fields": fsy.fields
					},
          featureSet: fsy
        };
	//timer.stop();//3
	lyrs.fy = new esri.layers.FeatureLayer(fcy,{
			mode:esri.layers.FeatureLayer.MODE_SNAPSHOT,
			id:"lyrY",
			dataAttributes:["FID"]
	});	
	//timer.stop();//4
	return lyrs;
}

function initLayers(data){
	var timer = new Timer(arguments);
	timer.start();
	//console.log(data)
	f = layerMaker(data);
	f1 = f.fx;
	f2 = f.fy;

	var markerSym = new esri.symbol.SimpleMarkerSymbol();
	markerSym.outline.setWidth(0);
	markerSym.setSize(0);
	lx = layerDefs[sL[0]];
	ly = layerDefs[sL[1]];
	
	var r1 = new esri.renderer.SimpleRenderer(markerSym);   
	r1.setColorInfo({
		field:lx.colField,
		stops:setColStops(lx)
	});
	f1.setRenderer(r1);
	
	var r2 = new esri.renderer.SimpleRenderer(markerSym);   
	r2.setColorInfo({
		field:ly.colField,
		stops:setColStops(ly)
	});
	f2.setRenderer(r2);	
	
	map.addLayers([f1,f2]);
	
	var chartData = data.features.map(function(d){
		var featureData = d.attributes;
		featureData.mx = d.geometry.x;
		featureData.my = d.geometry.y;
		sumVals.f += d.attributes.For2008;
		sumVals.vx += d.attributes[lx.sumField];
		sumVals.vy += d.attributes[ly.sumField];
		sumVals.p += d.attributes.Tot_plots;		
		return featureData;
	});

	initChart(chartData);

	//initAreaSymbols();
	initCounters();
	timer.stop();
}	
	
function customLegend(l,d){
	var timer = new Timer(arguments);
	timer.start();
	var xLeft = 55;
	var lt = l.text();
	var ld = layerDefs.filter(function(d) {return d.title == lt})[0];
	if(ld.stops.length == 2){
		var r = genRange(0,1,0.25).map(function(r){return {value:parseInt(ld.valScale(r)),size:parseInt(ld.sizeScale(ld.valScale(r))),color:ld.colScale(ld.valScale(r))}});
	}else{
		var r = ld.stops.map(function(d,i){return {value:d,size:ld.symbolSizes[i],color:ld.colScale(d)}});
	}
	var p = "#"+l.parent().parent().attr("id");
	
	if(d == "reverse"){
		r = r.reverse();
	}
	
	d3.select(p).selectAll("svg").remove();
	
	var svg = d3.select(p)
		.append('svg')
		.attr("class","svgL");
			
	svg.append("text")
		.attr("x",xLeft)
		.attr("y",20)
		.attr("font-size","20px")
		.attr("font-weight","bold")
		.style("text-anchor","midde")
		.text(ld.legendDef)
		
	svg.selectAll(".lgndPt")
		.data(r)
		.enter()
		.append("circle")
		.attr("class","lgndPt")
		.attr("r",function(d){return d.size * 0.5})
		.attr("cx",xLeft + 10)
		.attr("cy",function(d,i){return 8 + (i+1)* 41})
		.attr("fill",function(d){return d.color})
		.style('opacity',colAlpha);
		
	svg.selectAll(".lgndTxt")
		.data(r)
		.enter()
		.append("text")
		.attr("class","lgndTxt")
		.attr("x",xLeft + 40)
		.attr("y",function(d,i){return 8 + (i+1) * 41})
		.attr("dy","0.35em")
		.text(function(d){return d.value});
	timer.stop();
}
function scaleLegend(){
	var timer = new Timer(arguments);
	timer.start();
	d3.selectAll(".lgndPt").transition().duration(300).attr('r',function(d){
		return scaleSymbSize(d.size);
	});
	timer.stop()
}

function filterChartBasedOnMap(){
	var timer = new Timer(arguments);
	timer.start();
	var ext = map.extent;
	d3.selectAll(".dot").transition().duration(300).attr("r", function(n){
		if(inRange(n.mx,[ext.xmin,ext.xmax]) && inRange(n.my,[ext.ymin,ext.ymax])){
			return r(n.PctFor2008);
		}else{
			return 0;
		}
	});	
	timer.stop();
}

function renderMapBasedOnChart(){
	var timer = new Timer(arguments);
	timer.start();
	var ls = ['X','Y'];
	var lds = getLyrs();
	var ext = map.extent;
	ls.map(function(l,i){
		map.getLayer("lyr"+l).graphics.map(function(g){
			var vX = lds.X.valField;
			var vY = lds.Y.valField;
			if(inRange(g.geometry.x,[ext.xmin,ext.xmax]) && inRange(g.geometry.y,[ext.ymin,ext.ymax])){
				if(inRange(g.attributes[vX],x.domain()) && inRange(g.attributes[vY],y.domain())){
					var r = parseInt(scaleSymbSize(lds[l].sizeScale(g.attributes[lds[l].valField])));
					g.getNode().setAttribute('r',r);
				}else{
					g.getNode().setAttribute('r',0);
				}
			}
		});
	});
	timer.stop();
	timer.start();
	initMapHighlight();
	timer.stop();
}

function initMapSymbols(lyrs){
	var timer = new Timer(arguments);
	timer.start();
	var lds = getLyrs();
	lyrs.map(function(l,i){
		var id = l.id.slice(-1);
		l.on("graphic-node-add",function(g){
			g.node.setAttribute('r',parseInt(scaleSymbSize(lds[id].sizeScale(g.graphic.attributes[lds[id].valField]))));
			g.node.onmouseover(function(){
				highlightPoints(this.getAttribute("data-"+featureId));
			});
			g.node.onmouseout(function(){unhighlightPoints();});
		});
	});
	timer.stop()
}

function getData(){
	var timer = new Timer(arguments);
	timer.start();	
		$.getJSON("json/conus_emap_hexes.json", function(data){
			data.features = data.features.filter(function(d) {return ((d.attributes.ForPlots13 >= minPlots) || (d.attributes.ForPlots08 >= minPlots))});
			initLayers(data);
		});
	timer.stop()
}

function addHomeSlider() {  
	//let's add the home button slider as a created class, requrires dom-Attr  
	dojo.create("div", {    
							 className: "esriSimpleSliderHomeButton",    
							 title: 'Zoom to Full Extent',    
							 onclick: function () {    
										 //map.setExtent(initExtent);    
										 map.centerAndZoom([-86.45,38.75],5);
									}    
							}, dojo.query(".esriSimpleSliderIncrementButton")[0], "after");   
}  

//build map
require([
	"esri/map", "esri/basemaps","dojo/domReady!"
  ], function(
		Map, esriBasemaps
  ) {
		
	//define basemap *no reference layer!*
	esriBasemaps.lightGray = {
		baseMapLayers: [{url:"http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"}],
		title: "lightGray"
	};
	esriBasemaps['dark-gray'] = {
		baseMapLayers: [{url:"http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer"}],
		title: "dark-gray"
	};

	//initiate map
	map = new Map("map", {
		basemap: "dark-gray",
		center: [-82.45, 47.75], // longitude, latitude
		zoom: 5,
		minZoom:zoomRange.min,
		maxZoom:zoomRange.max
	});
	map.on("load",function(){
		getData();
		addHomeSlider();
		$(window).trigger("resize");
	});

	//do stuff after layers are added
	map.on("layers-add-result",function(lyrs){
		//console.log(map.graphicsLayerIds);
		var mapWidth = $("#map").width();	
		var swipePos = parseInt(mapWidth * 0.80);
		customLegend($("#lX"),layerDefs[sL[0]].legendOrder);
		customLegend($("#lY"),layerDefs[sL[1]].legendOrder);
		initSwipe();
		map.on("extent-change",function(){
			swipeTransform();
			scaleLegend();
			renderMapBasedOnChart();
			filterChartBasedOnMap();
			updateAllCounters(sumVar());
		});		
		initMapSymbols(lyrs.layers.map(function(l){return l.layer}));
	});

	map.on("pan",function(){		
		console.log('pan');
		swipeTransform();
	});

});

$(window).resize(function(){	
	var ht = $(window).height()-20;
	$("#mapContainer").outerWidth($(window).width() - 426);
	$("#mapContainer").outerHeight(ht);
	$("#swipeZone").outerHeight(ht);
	$("#swipeZone").offset({"top":$("#mapContainer").offset().top});
});


//d3 charting functions;
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
				updateAllCounters(sumVar());
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
				unhighlightPoints();
				highlightPoints(d[featureId]);
			});
			
		
	function zoom() {
		d3.select(".x.axis").call(xAxis);
		d3.select(".y.axis").call(yAxis);
		var lds = getLyrs();
		d3.selectAll(".dot").attr("transform", function(d) {return transform(d[lds.X.valField],d[lds.Y.valField])});
		unhighlightPoints();		
	}
}


//populate layer selection dropdowns
lyrDims = ['X','Y'];
function DropDown(n) {
    this.dd = n, this.placeholder = this.dd.children("span"), this.opts = this.dd.find("ul.dropdown > li"), this.val = "", this.index = -1, this.initEvents()
}
DropDown.prototype = {
    initEvents: function() {
        var n = this;
        n.dd.on("click", function(n) {
            return $(this).toggleClass("active"), !1
        }), n.opts.on("click", function() {
            var t = $(this);
            n.val = t.text(), n.index = t.index(), n.placeholder.text(n.val);
						selectLayers(lyrDims[parseInt(this.parentNode.parentNode.value)]);
				})
    },
    getValue: function() {
        return this.val
    },
    getIndex: function() {
        return this.index
    }
}
$(function() {
    var dd1 = new DropDown($("#dd0"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
})

$(function() {
    var dd2 = new DropDown($("#dd1"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
});

function populateDropdown(id){
	var dd = $("#dd" + id);
	dd.val(id);
	var s = dd.find("span");
	var ul = dd.find(".dropdown");
	s.text(layerDefs[sL[id]].title);
	layerDefs.map(function(d){
		ul.append(
			$(document.createElement("li"))
			.append(
				$(document.createElement("a"))
				.attr("href","#")
				.text(d.title)
			)
		)
	});
}
			
populateDropdown(0);populateDropdown(1);