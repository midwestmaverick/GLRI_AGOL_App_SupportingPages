var map, layerSwipe, legend1, legend2, LegendGen;
var featureId = "OBJECTID";
var forestedValue = "Fper";
var lyrMax = 0, maxLyrSum = 0; 
var mapLayers = [];
var zoomRange = {min:5,max:10};
//symbol size range
var sr = {min:2,max:10};

//var hucServiceURL = 'http://199.131.112.82:6080/arcgis/rest/services/jdgarner/HexPtTest/MapServer/0';
var hucServiceURL = 'http://services1.arcgis.com/gGHDlz6USftL5Pau/arcgis/rest/services/HexPtTest3/FeatureServer/0';

var colAlpha = 0.8;
var layerDefs = [
	{
		title:"Forested Percentage",
		valField:"Fper",
		colField:"Fper",
		colors:[
			[197,208,193,colAlpha],
			[0,109,44,colAlpha]
		],
		legendDef:"Percent",
		stops:[0,100],
		symbolSizes:[sr.min,sr.max]
	},
	{
		title:"Nonforested Percentage",
		valField:"NFper",
		colField:"NFper",
		colors:[
			[255,0,0,colAlpha],
			[255,150,150,colAlpha],
			[150,150,150,colAlpha],
			[150,150,255,colAlpha],
			[0,0,255,colAlpha]
		],
		legendDef:"Percent",
		stops:[0,70,80,90,100],
		symbolSizes:[sr.max,sr.min+1,sr.min,sr.min+1,sr.max]
	}
];

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

function highlightPoints(id){
	//console.log(id);
	d3.select("#map_layers").selectAll("circle").filter(function(d){
		if(this.getAttribute('data-OBJECTID') == id){
			return this;
		}
	}).attr("id","mapHighlight");
	var cs = d3.selectAll(".dot").filter(function(d){return d.id == id}).datum();
	d3.select(".objects").append("circle").attr("id","chartHighlight").attr('r',r(cs.fper)).attr("transform", transform(cs));
}
function unhighlightPoints(){
	d3.select("#map_layers").selectAll("circle").attr("id","");
	d3.select("#chartHighlight").remove();
}	
function initMapHighlight(){
	$("circle", $("#map_layers")).mouseover(function(){
		highlightPoints(this.getAttribute("data-OBJECTID"));
	});
	$("circle", $("#map_layers")).mouseout(function(){unhighlightPoints();});
}

//Map functions
function selectLayers(d){
	var l = $("#l"+d).text();
	var ld = layerDefs.filter(function(d){return d.title == l})[0];
	var ml = map.getLayer("lyr"+d);
	ml.graphics.map(function(g){
		g.symbol.setColor(new esri.Color(ld.colScale(g.attributes[ld.colField])));
	});
	ml.redraw();
	customLegend($("#l"+d));
}
function swipeTransform(){
	var w = $("body").width();
	var h = $("#swipeHandle");
	var l = h.position().left + (0.5 * h.width());
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
	var w = $("body").width();
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
	
	$('#swipeHandle').draggable({axis:"x",containment: "parent",drag:swipeTransform})
	
	var ht = h+$("#swipeBar").height()+10;
	$("#swipeZone").height(ht);
	
	$("#lyr1_layer").attr("clip-path","url(#gfx_clip1)");
	$("#lyr2_layer").attr("clip-path","url(#gfx_clip2)");

	swipeTransform();
}
function initLayers(data){
	var ld = layerDefs;
	var chartData = [];
	var g1 = new esri.layers.GraphicsLayer();
	var g2 = new esri.layers.GraphicsLayer();
	g1.id = "lyrX";
	g2.id = "lyrY";
	data.features.map(function(d){
		var geom = new esri.geometry.Point(d.geometry);
		var symb1 = new esri.symbol.SimpleMarkerSymbol()
								.setColor(new esri.Color(ld[0].colScale(d.attributes[ld[0].colField])))
								//.setSize(ld[0].sizeScale(d.attributes[ld[0].valField]))
								.setSize(0)
								.setOutline(null);
		var symb2 = new esri.symbol.SimpleMarkerSymbol()
								.setColor(new esri.Color(ld[1].colScale(d.attributes[ld[1].colField])))
								//.setSize(ld[1].sizeScale(d.attributes[ld[1].valField]))
								.setSize(0)
								.setOutline(null);
		var att = d.attributes;
		g10 = new esri.Graphic(geom,symb1,att)
		g20 = new esri.Graphic(geom,symb2,att)
		g1.add(g10);
		g2.add(g20);
			
		chartData.push({
			x:d.attributes[ld[0].valField],
			y:d.attributes[ld[1].valField],
			id:d.attributes[featureId],
			fper:d.attributes[forestedValue]
		});
	});
	map.addLayers([g1,g2]);
	popDomData();
	//initChart(chartData);
}

function popDomData(){
	map.getLayer("lyrX").graphics.map(function(g){
		g.attr("data-OBJECTID",g.attributes[featureId]);
		g.attr("data-X",g.attributes[layerDefs[0].valField]);
		g.attr("data-Y",g.attributes[layerDefs[1].valField]);
		g.attr("class","X");
	});
	map.getLayer("lyrY").graphics.map(function(g){
		g.attr("data-OBJECTID",g.attributes[featureId]);
		g.attr("data-X",g.attributes[layerDefs[0].valField]);
		g.attr("data-Y",g.attributes[layerDefs[1].valField]);
		g.attr("class","X");
	});
}

function customLegend(l){
	var xLeft = 40;
	var lt = l.text();
	var ld = layerDefs.filter(function(d) {if(d.title == lt){return d}})[0];
	if(ld.stops.length == 2){
		var r = genRange(0,1,0.25).map(function(r){return {value:parseInt(ld.valScale(r)),size:parseInt(ld.sizeScale(ld.valScale(r))),color:ld.colScale(ld.valScale(r))}});
	}else{
		var r = ld.stops.map(function(d,i){return {value:d,size:ld.symbolSizes[i],color:ld.colScale(d)}});
	}
	var p = "#"+l.parent().parent().attr("id");
	
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
	var start = new Date().getTime();
	var ext = esri.geometry.webMercatorToGeographic(map.extent);
	var idArray = map.getLayer("lyrX").graphics.filter(function(g){if(inRange(g.geometry.x,[ext.xmin,ext.xmax]) && inRange(g.geometry.y,[ext.ymin,ext.ymax])){return g}}).map(function(g){return g.attributes.OBJECTID});
	d3.selectAll(".dot").transition().duration(300).attr("r", function(n){
		if($.inArray(n.id,idArray) > 0){
			return r(n.fper);
		}else{
			return 0;
		}
	});	
	console.log("filterChart time:" + parseInt(new Date().getTime() - start));
}

function renderMapBasedOnChart(){
	var lds = {"X":layerDefs.filter(function(d){return d.title == $("#lX").text()})[0], "Y":layerDefs.filter(function(d){return d.title == $("#lY").text()})[0]};
	/*
	var lx = map.getLayer("lyrX");
	var ly = map.getLayer("lyrY");
	lx.graphics.map(function(g){
		if(inRange(g.attributes[lds.X.valField],x.domain()) && inRange(g.attributes[lds.Y.valField],y.domain())){
			g.symbol.setSize(scaleSymbSize(lds.X.sizeScale(g.attributes[lds.X.valField])));
		}else{
			g.symbol.setSize(0);
		}
	});
	lx.redraw();
	ly.graphics.map(function(g){
		if(inRange(g.attributes[lds.X.valField],x.domain()) && inRange(g.attributes[lds.Y.valField],y.domain())){
			g.symbol.setSize(scaleSymbSize(lds.Y.sizeScale(g.attributes[lds.Y.valField])));
		}else{
			g.symbol.setSize(0);
		}
	});
	ly.redraw();
*/
	d3.select("#map_gc").selectAll(".X").transition().duration(100).attr('r',function(){
		var g = {
			"X":this.getAttribute('data-X'),
			"Y":this.getAttribute('data-Y')
		};
		if(inRange(g.X,x.domain()) && inRange(g.Y,y.domain())){	
			return scaleSymbSize(lds.X.sizeScale(g.X));
		}else{
			return 0;
		}
	});
	d3.select("#map_gc").selectAll(".Y").transition().duration(100).attr('r',function(){
		var g = {
			"X":this.getAttribute('data-X'),
			"Y":this.getAttribute('data-Y')
		};
		if(inRange(g.X,x.domain()) && inRange(g.Y,y.domain())){	
			return scaleSymbSize(lds.X.sizeScale(g.X));
		}else{
			return 0;
		}
	});
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
		//$.getJSON("json/conus_emap_hexes.json",initLayers);
	});
	
	//add home button to map
	var home = new HomeButton({
		map: map
	}, "HomeButton");
	home.startup();

	//do stuff after layers are added
	map.on("layers-add-result",function(lyrs){
		//console.log(map.graphicsLayerIds);
		var mapWidth = $("#map").width();	
		var swipePos = parseInt(mapWidth * 0.80);
		customLegend($("#lX"));
		customLegend($("#lY"));
		//var totFor = map.getLayer(layerDefs[0].valField);	
		initSwipe();
	});

	map.on("extent-change",function(){

	});

	map.on("pan",function(){		
		swipeTransform();
	});
	
	map.on("update-start",function(){
		console.log("upstart");
		//scaleLegend();
	});
	
	map.on("update-end",function(){
		//renderMapBasedOnChart();
		//filterChartBasedOnMap();
		swipeTransform();
		console.log("upend");
	});
	
	//initMapHighlight();
});

/*

*/
