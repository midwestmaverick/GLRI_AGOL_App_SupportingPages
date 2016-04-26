var map, layerSwipe, legend1, legend2, LegendGen, outData, initExtent;
var minPlots = 10;
var liveData;
var featureId = "FID";
var lyrMax = 0, maxLyrSum = 0; 
var mapLayers = [];
var zoomRange = {min:5,max:10};
var f08 = "For2008";
var f13 = "For2013";
var aScale = d3.scale.linear();

//startupLayers
var sL = [5,2];


//scale values
function sV(obj,ld){
	return obj[ld.valField]*ld.scalingFactor;
}

//General utilities
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
	//console.log(id);
	var lds = getLyrs();
	d3.select("#map_layers").selectAll("circle").filter(function(d){
		if(this.getAttribute('data-'+featureId) == id){
			return this;
		}
	}).attr("id","mapHighlight");
	var cs = d3.selectAll(".dot").filter(function(d){return d[featureId] == id}).datum();
	d3.select(".objects").append("circle").attr("id","chartHighlight").attr('r',r(cs.PctFor2008)).attr("transform", transform(cs[lds.X.valField],cs[lds.Y.valField]));
}
function unhighlightPoints(){
	d3.select("#map_layers").selectAll("circle").attr("id","");
	d3.select("#chartHighlight").remove();
}	
function initMapHighlight(){
	$("circle", $("#map_layers")).mouseover(function(){
		highlightPoints(this.getAttribute("data-"+featureId));
	});
	$("circle", $("#map_layers")).mouseout(function(){unhighlightPoints();});
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
		.attr("width","20%")
		.append("text")
		.attr("id",id)
		.style({"font-size":"110%"})
		.text(txt);
}

function initCounters(){
	lds = getLyrs();
	counterRow("fcTitle","Forested Acres:");
	counterData("forestCounter","0000");
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("xCTitle",lds.X.title+":");
	counterData("xCounter","0000");	
	counterRow("xCPerTitle","(% of Forest:)");
	counterData("xPer","(0.000%)");
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("yCTitle",lds.Y.title+":");
	counterData("yCounter","0000");
	counterRow("xCPerTitle","(% of Forest:)");
	counterData("yPer","(0.000%)");	
	d3.select("#counters").append("tr").style("height","10px");
	counterRow("pTitle","FIA Plot count:");
	counterData("pCounter","0000");	
}

function updateIntCounter(counterId,newVal){
	var oldVal = parseInt($(counterId).text());
	d3.select(counterId).transition().duration(1000).tween("text",function(d){
		var i = d3.interpolate(oldVal,newVal);
		return function(t) {
			d3.select(this).text(parseInt(i(t))+"ac");
		};
	});
}

function updatePerCounter(counterId,newVal){
	var fp = d3.format(".3%")
	oldVal = parseFloat($(counterId).text().replace("(","").replace(")","")) * 0.01;
	d3.select(counterId).transition().duration(1000).tween("text",function(d){
		var i = d3.interpolate(oldVal,newVal);
		return function(t) {
			d3.select(this).text("("+fp(i(t))+")");
		};
	});
}

function sumVar(){
	var start = new Date().getTime();
	var ext = map.extent;
	var lds = getLyrs()
	var vSum = {
		f:0,
		vx:0,
		vy:0,
		p:0
	}
	map.getLayer("lyrX").graphics.filter(function(g){
		return (inRange(g.geometry.x,[ext.xmin,ext.xmax])
						&& inRange(g.geometry.y,[ext.ymin,ext.ymax])
						&& inRange(g.attributes[lds.X.valField],x.domain())
						&& inRange(g.attributes[lds.Y.valField],y.domain()))
	}).map(function(c){
		vSum.f += parseFloat(c.attributes.For2008);
		vSum.vx += parseFloat(c.attributes[lds.X.sumField]);
		vSum.vy += parseFloat(c.attributes[lds.Y.sumField]);
		vSum.p += parseInt(c.attributes.Tot_plots);
	});
	console.log("filterChart time:" + parseInt(new Date().getTime() - start));
	return vSum;
}

function updateAllCounters(){
	var lds = getLyrs()
	var vSum = sumVar();
	updateIntCounter("#forestCounter",parseInt(vSum.f));
	updateIntCounter("#xCounter",parseInt(vSum.vx));
	updateIntCounter("#yCounter",parseInt(vSum.vy));
	updateIntCounter("#pCounter",parseInt(vSum.p));
	if(vSum.f == 0){
		vx = 0;
		vy = 0;
	}else{
		vx = vSum.vx/vSum.f;
		vy = vSum.vy/vSum.f;
	}
	updatePerCounter("#xPer",vx);
	updatePerCounter("#yPer",vy);
	//updateAreaCircle("#forestCircle",vSum.f);
	//updateAreaCircle("#xCircle",vSum.vx);
	//updateAreaCircle("#yCircle",vSum.vy);
	if(vSum.vx > vSum.vy){
		$("#xCircle").attr("class","circle2");
		$("#yCircle").attr("class","circle1");
	}else{
		$("#xCircle").attr("class","circle1");
		$("#yCircle").attr("class","circle2");
	}
}

//Map functions
function selectLayers(d){
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
	updateAllCounters();
	renderMapBasedOnChart();
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

	swipeTransform();
}
function layerMaker(data,id){
	var fs = new esri.tasks.FeatureSet(data);
	outData = fs;

	var fc = {
          layerDefinition: {
            "geometryType": "esriGeometryPoint",
            "fields": fs.fields
					},
          featureSet: fs
        };
	var f = new esri.layers.FeatureLayer(fc,{
			//outFields:layerDefs.map(function(d){return d.valField}),
			id:id,
			//styling:false,
			dataAttributes:["FID"]
	});	
	return f;
}

function initLayers(data){
	//console.log(data)
	f1 = layerMaker(data,"lyrX");
	f2 = layerMaker(data,"lyrY");
	var markerSym = new esri.symbol.SimpleMarkerSymbol();
	markerSym.outline.setWidth(0);
	markerSym.setSize(0);
	var r1 = new esri.renderer.SimpleRenderer(markerSym);   
	r1.setColorInfo({
		field:layerDefs[sL[0]].colField,
		stops:setColStops(layerDefs[sL[0]])
	});
	f1.setRenderer(r1);
	var r2 = new esri.renderer.SimpleRenderer(markerSym);   
	r2.setColorInfo({
		field:layerDefs[sL[1]].colField,
		stops:setColStops(layerDefs[sL[1]])
	});
	f1.setRenderer(r1);	
	f2.setRenderer(r2);	
	map.addLayers([f1,f2]);
	var chartData = data.features.map(function(d){
		var featureData = d.attributes;
		featureData.mx = d.geometry.x;
		featureData.my = d.geometry.y;
		return featureData;
	});
	initChart(chartData);
	//initAreaSymbols();
	initCounters();
}	
	
function customLegend(l,d){
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
		.attr("cy",function(d,i){return 3 + (i+1)* 40})
		.attr("fill",function(d){return d.color})
		.style('opacity',colAlpha);
		
	svg.selectAll(".lgndTxt")
		.data(r)
		.enter()
		.append("text")
		.attr("class","lgndTxt")
		.attr("x",xLeft + 30)
		.attr("y",function(d,i){return 3 + (i+1) * 40})
		.attr("dy","0.35em")
		.text(function(d){return d.value});
		
}
function scaleLegend(){
	d3.selectAll(".lgndPt").transition().duration(300).attr('r',function(d){
		return scaleSymbSize(d.size);
	});
}

function filterChartBasedOnMap(){
	var ext = map.extent;
	d3.selectAll(".dot").transition().duration(300).attr("r", function(n){
		if(inRange(n.mx,[ext.xmin,ext.xmax]) && inRange(n.my,[ext.ymin,ext.ymax])){
			return r(n.PctFor2008);
		}else{
			return 0;
		}
	});	
}

function renderMapBasedOnChart(){
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
}

function a2r(a){
	return Math.sqrt(a/Math.PI)
}

function initAreaSymbols(){
	landArea = 1053356477;
	hexArea = 160300;
	bigR = 190;
	var ox = 200;
	var oy = 205;
	
	var data = sumVar();
	aScale.domain([0,a2r(data.f)])
	aScale.range([0,bigR]);

	var svg = d3.select("#areaSymbolContainer")
						.append("svg")
						.attr("id","areaCircleSvg")
						.attr("height","400px")
						.attr("width","400px")
						.style("margin","5px");

	function drawCircle(r,fillCol,id){
		svg.append("circle")
			.attr("id",id)
			.attr("r",r)
			.attr("cx",ox)
			.attr("cy",(oy + bigR) - r)
			.style("fill",fillCol);		
	}
		 
	var lar = aScale(a2r(landArea))
	svg.append("circle")
		 .attr("r",lar)
		 .attr("cx",ox)
		 .attr("cy",(oy - bigR) + lar)
		 .style("stroke","white")
		 .style("stroke-width",2)
		 .style("fill","none");

	var fr = aScale(a2r(data.f));
	var xr = aScale(a2r(data.vx));
	var yr = aScale(a2r(data.vy));
	drawCircle(fr,"green","forestCircle");
	drawCircle(xr,"#f7fcb9","xCircle");
	drawCircle(yr,"#31a354","yCircle");
	if(xr > yr){
		$("#xCircle").attr("class","circle2");
		$("#yCircle").attr("class","circle1");
	}
	
	svg.append("text")
	 .attr("x","1")
	 .attr("y","13")
	 .style("fill","white")
	 .style("text-size","1.5em")
	 .text("Total Land Area: " + landArea + " acres");
}

function updateAreaCircle(id,newVal){
	var c = d3.select(id);
	var oldVal = parseInt(c.attr("r"));
	d3.select(id).transition().duration(2000).tween("r",function(d){
		var i = d3.interpolate(oldVal,parseInt(aScale(a2r(Math.abs(newVal)))));
		return function(t) {
			c.attr("r",i(t));
			c.attr("cy",(200 + 195)-i(t));
		};
	});
}


function getData(){
		$.getJSON("json/conus_emap_hexes.json", function(data){
			data.features = data.features.filter(function(d) {return ((d.attributes.ForPlots13 >= minPlots) || (d.attributes.ForPlots08 >= minPlots))});
			initLayers(data);
		});
}

function addHomeSlider() {  
	//let's add the home button slider as a created class, requrires dom-Attr  
	dojo.create("div", {    
							 className: "esriSimpleSliderHomeButton",    
							 title: 'Zoom to Full Extent',    
							 onclick: function () {    
										 map.setExtent(initExtent);    
									}    
							}, dojo.query(".esriSimpleSliderIncrementButton")[0], "after");   
}  

//build map
require([
	"esri/map", "esri/basemaps", "esri/geometry/Extent", 
	"esri/dijit/HomeButton","esri/layers/FeatureLayer", "esri/urlUtils",
	"dojo/domReady!"
  ], function(
		Map, esriBasemaps, Extent, 
		HomeButton, FeatureLayer, urlUtils
  ) {
		
	//define basemap *no reference layer!*
	esriBasemaps.lightGray = {
		baseMapLayers: [{url:"http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"}],
		title: "lightGray"
	};

	//initiate map
	map = new Map("map", {
		basemap: "lightGray",
		center: [-82.45, 38.75], // longitude, latitude
		zoom: 5,
		minZoom:zoomRange.min,
		maxZoom:zoomRange.max
	});
	map.on("load",function(){
		getData();
		initExtent = map.extent;
		addHomeSlider();
		
		
		
	});
	/*
	//add home button to map
	var home = new HomeButton({
		map: map
	}, "HomeButton");
	home.startup();
	*/
	//do stuff after layers are added
	map.on("layers-add-result",function(lyrs){
		//console.log(map.graphicsLayerIds);
		var mapWidth = $("#map").width();	
		var swipePos = parseInt(mapWidth * 0.80);
		customLegend($("#lX"),layerDefs[sL[0]].legendOrder);
		customLegend($("#lY"),layerDefs[sL[1]].legendOrder);
		//var totFor = map.getLayer(layerDefs[sL[0]].valField);	
		initSwipe();
		initMapHighlight();
		map.on("extent-change",function(){
			swipeTransform();
			scaleLegend();
			renderMapBasedOnChart();
			filterChartBasedOnMap();
			updateAllCounters();
		});
				
	});

	map.on("pan",function(){		
		swipeTransform();
	});
	
	
	
	
});

$(window).resize(function(){	
	$("#mapContainer").outerWidth($(window).width() - 436);
	$("#mapContainer").outerHeight($(window).height()-10);
	$("#swipeZone").outerHeight($("#mapContainer").innerHeight());
});