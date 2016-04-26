var map, layerSwipe, legend1, legend2, LegendGen;
var featureId = "OBJECTID";
var forestedValue = "Fper";
var lyrMax = 0, maxLyrSum = 0; 
var mapLayers = [];
var zoomRange = {min:5,max:10};
//symbol size range
var sr = {min:1,max:5};

//var hucServiceURL = 'http://199.131.112.82:6080/arcgis/rest/services/jdgarner/HexPtTest/MapServer/0';
var hucServiceURL = 'http://services1.arcgis.com/gGHDlz6USftL5Pau/arcgis/rest/services/HexPtTest3/FeatureServer/0';

var colAlpha = 0.8;
var layerDefs = [
	{
		title:"Forested Percentage",
		featureURL:hucServiceURL,
		valField:"Fper",
		colField:"Fper",
		colors:[
			[197,208,193,colAlpha],
			[0,109,44,colAlpha]
		],
		vis:true,
		legendDef:"Percent",
		stops:[0,100],
		symbolSizes:[sr.min,sr.max]
	},
	{
		title:"Nonforested Percentage",
		featureURL:hucServiceURL,
		valField:"NFper",
		colField:"NFper",
		colors:[
			[255,0,0,colAlpha],
			[255,150,150,colAlpha],
			[150,150,150,colAlpha],
			[150,150,255,colAlpha],
			[0,0,255,colAlpha]
		],
		vis:false,
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
function calcOffsets() {
	map.graphicsLayerIds.map(function(d){map.getLayer(d).setMaxAllowableOffset(map.extent.getWidth() / map.width)});
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
function selectLayers(){
	var layer1 = $("#layer1");
	var l1 = layer1.text();
	var ml1 = mapLayers.filter(function(d) {if(d.className == l1){return d}})[0];
	ml1.show();
	var el1 = $("#"+ml1.id + "_layer");
	el1.attr("clip-path","url(#gfx_clip1)");
	map.reorderLayer(ml1,1);	
	customLegend(layer1);
	var layer2 = $("#layer2");
	var l2 = layer2.text();
	if(l2 !== "None" && l2 !== l1){
		var ml2 = mapLayers.filter(function(d) {if(d.className == l2){return d}})[0];
		var el2 = $("#"+ml2.id + "_layer");
		ml2.show();
		map.reorderLayer(ml2,0);
		el2.attr("clip-path","url(#gfx_clip2)");
		customLegend(layer2);
	}else if(l1 == l2){
		el1.attr("clip-path","");
		customLegend(layer2);
	}
	var mln = mapLayers.filter(function(d) {if(d.className !== l1 && d.className !== l2){return d}});
	mln.map(function(d){
		d.hide();
		$("#"+d.id + "_layer").attr("clip-path","");
	});
	scaleLegend();
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
	swipeTransform();
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
		.attr("r",function(d){return d.size})
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
function buildBasicRenderer(l){
	var markerSym = new esri.symbol.SimpleMarkerSymbol();
	markerSym.outline.setWidth(0);
	markerSym.setSize(0);
	var renderer = new esri.renderer.SimpleRenderer(markerSym);   
	var colorInfo = {
		field:l.colField,
		stops:setColStops(l)
	}	
	renderer.setColorInfo(colorInfo);
	return renderer;
}
function queryDataToInitChart(){
	var start = new Date().getTime();
	var qt = new esri.tasks.QueryTask(hucServiceURL)
	var data;
	var layers = layerDefs.filter(function(d){if(d.title == $("#layer1").text() || d.title == $("#layer2").text()){return d}});
	sqlDefs = layers.map(function(d){return d.valField});
	sqlDefs.push(featureId);
	sqlDefs.push(forestedValue);
	query = new esri.tasks.Query()
		query.outFields=sqlDefs;
		query.geometry=map.extent;
		query.returnGeometry=false;

	qt.execute(query,function(results){	
		data = results.features.map(function(f){
			return {
				x:f.attributes[sqlDefs[0]],
				y:f.attributes[sqlDefs[1]],
				id:f.attributes[featureId],
				fper:f.attributes[forestedValue]
			}
		});
		initChart(data);
		renderMapBasedOnChart();
	});
	console.log("queryDataToInitChart:" + parseInt(new Date().getTime() - start));
	console.log(results.features.map(function(d){return {fper:d.attributes.Fper,nfper:d.attributes.NFper}}));
}
function filterChartBasedOnMap(){
	var start = new Date().getTime();
	query = new esri.tasks.Query();
		query.geometry=map.extent;
		query.returnGeometry=false;
		
	map.getLayer(layerDefs[0].valField).queryIds(query,function(results){
		d3.selectAll(".dot").transition().duration(300).attr("r", function(n){
			if($.inArray(n.id,results) > 0){
				return r(n.fper);
			}else{
				return 0;
			}
		});
		console.log("filterChart time:" + parseInt(new Date().getTime() - start));
	})
}
function renderMapBasedOnChart(){
	var ls = map.graphicsLayerIds;
	var chartIds = d3.selectAll(".dot").filter(function(d){if(inRange(d.x,x.domain()) && inRange(d.y,y.domain())){return d}}).data().map(function(d){return d.id});
	
	ls.map(function(l,i){
		var lyr = layerDefs.filter(function(d){if(d.valField == l){return d}})[0];
		d3.select("#"+l+"_layer").selectAll("circle").transition().duration(100).attr('r',function(d){
			var id = this.getAttribute('data-OBJECTID');
			if(chartIds.indexOf(parseInt(id)) > 0){	
				return scaleSymbSize(lyr.sizeScale(this.getAttribute('data-'+l)));
			}else{
				return 0;
			}
		});
	});
}
function queryLyrs(){
	var start = new Date().getTime();
	var data;
	var lyrs = layerDefs.filter(function(d){if(d.title == $("#layer1").text() || d.title == $("#layer2").text()){return d}});
	sqlDefs = lyrs.map(function(d){return d.valField});
	sqlDefs.push(featureId);
	sqlDefs.push(forestedValue);
	query = new esri.tasks.Query()
		query.geometry=map.extent;
		query.returnGeometry=false;
	
	map.getLayer(layerDefs[0].valField).queryFeatures(query,function(results){
		data = results.features.map(function(f){
			return {
				x:f.attributes[sqlDefs[0]],
				y:f.attributes[sqlDefs[1]],
				id:f.attributes[featureId],
				fper:f.attributes[forestedValue]
			}
		});
		console.log("queryLyrs time:" + parseInt(new Date().getTime() - start));
	}).then(function(){
		initChart(data);
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
		
	urlUtils.addProxyRule({
		urlPrefix: "services1.arcgis.com",
		proxyUrl: "PHP/proxy.php"
  });

	//build layer list
	layerDefs.map(function(l){
		var lyr = new FeatureLayer(l.featureURL,{
			mode: FeatureLayer.MODE_SNAPSHOT,
			outFields:layerDefs.map(function(d){return d.valField}),
			className:l.title,
			id:l.valField,
			visible:l.vis,
			//styling:false,
			dataAttributes:["OBJECTID",l.valField]
		});

		lyr.on("load",function(){
			lyr.setRenderer(buildBasicRenderer(l));
		});
		
		mapLayers.push(lyr);
	});
	
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
	})
	
	//add home button to map
	var home = new HomeButton({
		map: map
	}, "HomeButton");
	home.startup();

	//add layers to map
	map.addLayers(mapLayers);
	
	//do stuff after layers are added
	map.on("layers-add-result",function(lyrs){
		//console.log(map.graphicsLayerIds);
		var mapWidth = $("#map").width();	
		var swipePos = parseInt(mapWidth * 0.80);
		var totFor = map.getLayer(layerDefs[0].valField);	
		selectLayers();
		calcOffsets();
		initSwipe();
		queryDataToInitChart();
	});

	map.on('load',function(){
		map.graphics.enableMouseEvents();
		map.graphics.on("mouse-over",function(){
				console.log(this);
				highlightPoints(this.getAttribute("data-OBJECTID"));
			});
			
		map.graphics.on("mouse-out",unhighlightPoints);
	});
	
	map.on("extent-change",function(){
		calcOffsets();
	});

	map.on("pan",function(){		
		swipeTransform();
	});
	
	map.on("update-start",function(){
		console.log("upstart");
		scaleLegend();
	});
	
	map.on("update-end",function(){
		renderMapBasedOnChart();
		filterChartBasedOnMap();
		swipeTransform();
		console.log("upend");
	});
	
	//initMapHighlight();
});



/*


*/
