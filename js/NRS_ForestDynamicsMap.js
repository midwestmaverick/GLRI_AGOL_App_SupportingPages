function sortNumber(a,b) {
	return a - b;
}
function sortNumberReverse(a,b) {
	return b - a;
}

var map, layerSwipe, legend1, legend2;
var lyrMax = 0, maxLyrSum = 0; 
var mapLayers = [];

var hucServiceURL = 'http://services1.arcgis.com/gGHDlz6USftL5Pau/arcgis/rest/services/NRS_HUC_Change_shp/FeatureServer/0'

var layerDefs = [
	{"title":"Total Forest Area","featureURL":hucServiceURL,"valField":"FOR13AC","breaks":[10000,100000,500000,1000000],"colors":['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)'],"vis":true,"legendDef":"Acres"},
	{"title":"Forest Area Change","featureURL":hucServiceURL,"valField":"F13netanac","breaks":[-2000,-500,500,2000],"colors":['rgb(166,97,26)','rgb(223,194,125)','rgb(245,245,245)','rgb(128,205,193)','rgb(1,133,113)'],"vis":false,"legendDef":"Average Annual Acres"},
	{"title":"Area Cut","featureURL":hucServiceURL,"valField":"CUT13ANAC","breaks":[1000,5000,10000],"colors":[[0,0,200],[255,255,255]],"vis":false,"legendDef":"Average Annual Acres"},
	{"title":"Area Cut or Disturbed","featureURL":hucServiceURL,"valField":"C_DC13ANAC","breaks":[1000,5000,10000],"colors":[[0,0,0],[255,255,255]],"vis":false,"legendDef":"Average Annual Acres"}
];

var colAlpha = 0.3;

require([
	"esri/map", "esri/basemaps", "esri/geometry/Extent", "esri/dijit/HomeButton",
	"esri/layers/FeatureLayer", "esri/InfoTemplate", "esri/dijit/Legend",
	"esri/renderers/SimpleRenderer", "esri/renderers/ClassBreaksRenderer", "esri/Color", 
	"esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol",
	"esri/tasks/query","esri/tasks/QueryTask","esri/arcgis/OAuthInfo", "esri/IdentityManager",
	"dojo/domReady!"
  ], function(
	Map, esriBasemaps, Extent, HomeButton,
	FeatureLayer, InfoTemplate, Legend,
	SimpleRenderer, ClassBreaksRenderer, Color, 
	SimpleFillSymbol, SimpleLineSymbol, Query, QueryTask, OAuthInfo, esriId
  ) {
	////////////////////////////////////////////////////////
	//login auth to use AGOL hosted layers ###DON'T TOUCH###
	var info = new OAuthInfo({
		appId: "Fz7q4qQ1mbCeEYYF"
	});
	esriId.registerOAuthInfos([info]);
	////////////////////////////////////////////////////////
	
	//function for building a renderer based on min/max query results
	function buildRenderer(l, queryResults){
		var range = queryResults.features[0].attributes;
		var symbol = new esri.symbol.SimpleFillSymbol();
		symbol.setColor(new esri.Color(l.colors[0]));
		var renderer = new esri.renderer.ClassBreaksRenderer(symbol, l.valField)
		renderer.isMaxInclusive = true;
		l.breaks.push(range.maxVal);
		l.breaks.unshift(range.minVal);
		var breaks = l.breaks.slice().sort(sortNumber);
		for(i = 0; i < breaks.length-1; i++){
			var a = breaks[i];
			var b = breaks[i+1];
			//console.log(i + "=" + a + "-" + b);
			var col = new esri.Color(l.colors[i]);
			col.a = colAlpha;
			renderer.addBreak(a, b, new esri.symbol.SimpleFillSymbol().setColor(col));
		}
		renderer.defaultSymbol.color = new esri.Color([255,50,50,1]);
		return renderer;
	}		

	//function to query minimum and maximum values from layer attribute to use for renderer
	function rendMinMax(lyr,l){
		var maxDef = new esri.tasks.StatisticDefinition();
		maxDef.statisticType = "max";
		maxDef.onStatisticField = lyr.id;
		maxDef.outStatisticFieldName = "maxVal";
		
		var minDef = new esri.tasks.StatisticDefinition();
		minDef.statisticType = "min";
		minDef.onStatisticField = lyr.id;
		minDef.outStatisticFieldName = "minVal";

		var sdDef = new esri.tasks.StatisticDefinition();
		sdDef.statisticType = "stddev";
		sdDef.onStatisticField = lyr.id;
		sdDef.outStatisticFieldName = "sdVal";
		
		var fieldQuery = new esri.tasks.Query();				
		fieldQuery.outFields = [lyr.id];
		fieldQuery.outStatistics = [minDef,maxDef,sdDef];
		
		lyr.queryFeatures(fieldQuery,function(results){
			var renderer = buildRenderer(l, results);
			lyr.setRenderer(renderer);
			//results.forEach(function(d){if(d3.max(d.breaks) > maxLyrSum){maxLyrSum = d3.max(d.breaks)}});
		});
	}		

	//build layer list
	for(i = 0; i < layerDefs.length; i++){
		var l = layerDefs[i];
		var lyr = new esri.layers.FeatureLayer(l.featureURL,{
			outFields:["HUC_NAME",l.valField],
			className:l.title,
			id:l.valField,
			//infoTemplate: new esri.InfoTemplate("<div style='font: 18px Segoe UI'>${HUC_NAME} Average Annual:</div>", "<div style='font: 18px Segoe UI'><strong>Total forest area (ac): ${FOR13AC}.</strong></div>"),
			visible:l.vis,
			autoGeneralize:true,
		});
		rendMinMax(lyr,l);
		lyr.on("click",function(evt){featureClick(evt)});
		mapLayers.push(lyr);
	}
	
	//define basemap *no reference layer!*
	esriBasemaps.lightGray = {
		baseMapLayers: [{url:"http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"}],
		title: "lightGray"
	};
	
	//initiate map
	map = new Map("map", {
		basemap: "lightGray",
		center: [-85.45, 42.75], // longitude, latitude
		zoom: 5
	})
	
	map.on("extent-change",lyrSum);
	
	//add home button to map
	var home = new HomeButton({
		map: map
	}, "HomeButton");
	home.startup();

	//add layers to map
	map.addLayers(mapLayers);
	
	//do stuff after layers are present
	map.on("layers-add-result",function(){
		var mapWidth = document.getElementById("map").offsetWidth;
		var swipePos = parseInt(mapWidth * 0.80);
		var totFor = map.getLayer("FOR13AC");	
		initSwipe();
		selectLayers();
		
		//Find max single feature attribute value
		layerDefs.forEach(function(d){
			if(d3.max(d.breaks) > lyrMax){
				lyrMax = d3.max(d.breaks);
			}
		});
				
		//For some reason, once the legends are created, nothing else in here fires
		//Create legends last
		customLegend();
		
		var highlightSymbol = new SimpleFillSymbol(
			SimpleFillSymbol.STYLE_SOLID,
			new SimpleLineSymbol(
				SimpleLineSymbol.STYLE_SOLID,
				new Color([255,0,0]), 3
			),
			new Color([125,125,125,0.35])
		);
		map.graphics.enableMouseEvents();
	});

});

function lyrSum(){
	queryDefs = [];
	sqlDefs = [
		"F13netanac","FOR13AC","CUT13ANAC","DSTB13ANAC","C_D13ANAC","Shape_Area"
	]	
	
	sqlDefs.forEach(function(field){
		var sumDef = new esri.tasks.StatisticDefinition();
			sumDef.statisticType = "sum";
			sumDef.onStatisticField = field;
			sumDef.outStatisticFieldName = field;
		queryDefs.push(sumDef);
	});
	
	var fieldQuery = new esri.tasks.Query();				
		fieldQuery.outFields = [];
		fieldQuery.outStatistics = queryDefs;
		fieldQuery.geometry = map.extent;
		
	mapLayers[0].queryFeatures(fieldQuery,function(results){
		var fields = results.features[0].attributes;
		//console.log(fields);
		var val = [];
		gauges.forEach(function(g){
			var val = eval(g.statistic);
			g.gauge.needle.moveTo(val);
			g.gauge.readout[0][0].textContent = eval(g.readoutStat);
		});
	});
}

function selectLayers(){
	var layer1 = document.getElementById("layer1");
	var l1 = layer1.textContent;
	var ml1 = mapLayers.filter(function(d) {if(d.className == l1){return d}})[0];
	var el1 = document.getElementById(ml1.id + "_layer");
	ml1.show();
	el1.setAttribute("clip-path","url(#gfx_clip1)");
	map.reorderLayer(ml1,1);
	var layer2 = document.getElementById("layer2");
	var l2 = layer2.textContent;
	if(l2 !== "None" && l2 !== l1){
		var ml2 = mapLayers.filter(function(d) {if(d.className == l2){return d}})[0];
		var el2 = document.getElementById(ml2.id + "_layer");
		ml2.show();
		map.reorderLayer(ml2,0);
		el2.setAttribute("clip-path","url(#gfx_clip2)");
	}else if(l1 == l2){
		el1.setAttribute("clip-path","");
	}
	var mln = mapLayers.filter(function(d) {if(d.className !== l1 && d.className !== l2){return d}});
	mln.map(function(d){
		d.hide();
		document.getElementById(d.id + "_layer").setAttribute("clip-path","");
	});
	customLegend();
	
}
	
function customLegend(){
	var d = document;
	//clear previous legends
	var llist = d.getElementsByClassName("legend");
	while(llist[0]){
			llist[0].parentNode.removeChild(llist[0]);
	}
	
	//create new legends
	var infos = d.getElementsByClassName("info");
	[].forEach.call(infos,function(i){
		var p = i.getElementsByClassName("layerPicker")[0];
		var title = p.textContent;
		var lyr = layerDefs.filter(function(d){if(d.title == title){return d}})[0];
		//console.log(lyr);
		var breaks = lyr.breaks;
		var col = lyr.colors;
		
		var tab = d.createElement("table");
		tab.setAttribute("class","legend");
		var tr = d.createElement("tr");
		var th = d.createElement("th");
		th.setAttribute("class","legendTitle");
		th.setAttribute("colspan",2);
		th.textContent = lyr.legendDef;
		tr.appendChild(th);
		tab.appendChild(tr);
		for(var b = 0; b < breaks.length - 1; b++){
			var tr = d.createElement("tr");
			tr.setAttribute("class","legendRow");
			var colTd = d.createElement("td");
			var colDiv = d.createElement("div");
			colDiv.setAttribute("class","legendPatch");
			//console.log(lyr.title + " color " + b + ":" + col[b]);
			colDiv.style.backgroundColor = col[b];
			colTd.appendChild(colDiv);
			var titleTd = d.createElement("td");
			titleTd.textContent = breaks[b] + " - " + breaks[b+1];
			tr.appendChild(colTd);
			tr.appendChild(titleTd);
			tab.appendChild(tr);
		}
		i.appendChild(tab);
	});
}

function initChartDivs(){
	var tab = document.getElementById("gaugeTab");
	var ht = tab.offsetHeight * 0.98;
	var row = tab.getElementsByTagName("tr")[0];
	row.innerHTML = "";
	var w = tab.offsetWidth;
	var n = Math.min(parseInt(w/250),gauges.length);
	for(var i = 1; i <= n; i++){
		var td = document.createElement("td");
		var div = document.createElement("div");
		div.setAttribute("id","gauge"+i);
		div.setAttribute("class","gauge");
		td.appendChild(div);
		if(i !== n){
			td.setAttribute("style","border-right:1px solid rgba(0,0,0,0.15)");
		}
		row.appendChild(td);
		initGauge(gauges[i-1]);
	}
}

function resizeCharts(){
	var bod = document.body.offsetWidth;
	var cont = document.getElementById("chartContainer");
	cont.setAttribute("style","width:"+(bod - 430)+"px");	
	initChartDivs();
	lyrSum();
	var l = document.getElementById("swipeHandle");
	if(l.offsetLeft > bod){
		l.setAttribute("style","left:"+(bod*0.985));
	}
	var ht = (document.getElementById("map").offsetHeight + l.offsetHeight + 10) + "px";
	document.getElementById("swipeZone").style.height = ht;
}
window.onload = resizeCharts;
window.onresize = resizeCharts;

function swipeTransform(){
	var w = document.body.offsetWidth;
	var h = document.getElementById("swipeHandle");
	var l = h.offsetLeft + (0.5 * h.offsetWidth);
	var gl = d3.select("#map_graphics_layer")[0][0];
	var e = gl.transform.animVal[0].matrix.e;
	var cp1 = d3.select("#clip1rect")
	.attr("width",l)
	.attr("transform","matrix(1.0,0.0,0.0,1.0,"+(e*-1)+",0.0)");
	var cp2 = d3.select("#clip2rect")
	.attr("x",l)
	.attr("width",w-l)
	.attr("transform","matrix(1.0,0.0,0.0,1.0,"+(e*-1)+",0.0)");
}

function initSwipe(){
	var m = document.getElementById("map");
	var w = document.body.offsetWidth;
	var h = m.offsetHeight;
	var l = document.getElementById("swipeHandle").offsetLeft;
	
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
	
	$('#swipeHandle').draggable({axis:"x",containment: "parent"});
	enableSwipe();
}

function enableSwipe(){
	var isClicked = false;
	$("#swipeHandle")
	.mousedown(function() {
		isClicked = true;
	})
	.mousemove(function() {
		if(isClicked){
			console.log("pan map");
			swipeTransform();
		}
	})
	.mouseup(function() {
		swipeTransform();
		isClicked = false;
	})
	$("#map")
	.mousedown(function() {
		isClicked = true;
	})
	.mousemove(function() {
		if(isClicked){
			console.log("pan map");
			swipeTransform();
		}
	})
	.mouseup(function() {
		swipeTransform();
		isClicked = false;
	})
}

