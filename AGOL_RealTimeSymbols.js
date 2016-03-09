//Define global vars
var map, evalData, estData;
var idAttr = "StFips";
//var estVar = "Nonforest";	
var estVar = "Accessible forest";

function genMap(mapWindow){
	require([
	"dojo/parser", 
	"dojo/json",  
	"esri/Color",
	"dojo/number", 
	"dojo/dom-construct",

	"esri/map", 
	"esri/geometry/Extent",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol",
	"esri/renderers/SimpleRenderer",
	"esri/renderers/ClassBreaksRenderer",

	"esri/layers/FeatureLayer", 
	"esri/dijit/Legend", 
	"esri/request",

	"dijit/layout/BorderContainer", 
	"dijit/layout/ContentPane",
	"dojo/domReady!"
	], function(parser, JSON, Color, number, domConstruct,
	Map, Extent, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer, ClassBreaksRenderer, 
	FeatureLayer, Legend, esriRequest) {
		  
		parser.parse();
		var map = new Map("map", {
		  basemap: "topo",  //For full list of pre-defined basemaps, navigate to http://arcg.is/1JVo6Wd
		  center: [-96.45, 37.75], // longitude, latitude
		  zoom: 5
		});

		var fl = new FeatureLayer("http://199.131.112.82:6080/arcgis/rest/services/jdgarner/US_States_fia/MapServer/0", {
			outFields: ["STATE","StFips"],
			visible: true
		});

		fl.setRenderer(new SimpleRenderer(null));
		var updateEnd = fl.on("update-end", function() {
			updateEnd.remove();
			
			var apiUrl = "http://zlphefido001.phe.fs.fed.us/EvalidatorGRM/batcheval.jsp?reptype=State&lat= 0&lon= 0&radius= 0&snum=Area of sampled land and water, in acres&sdenom=No denominator - just produce estimate.&wc=012014,022014,042014,052014,062014,082014,092014,102014,112014,122014,132014,152014,162014,172014,182014,192014,202014,212014,222014,232014,242014,252014,262014,272014,282014,292014,302014,312014,322014,332014,342014,352014,362014,372014,382014,392014,402014,412014,422014,442014,452014,462014,472014,482014,492014,502014,512014,532014,542014,552014,562014&pselected=None&rselected=State code&cselected=Land class&ptime=Current&rtime=Current&ctime=Current&wf=&wnum=&wnumdenom=&schemaName=FS_FIADB.&outputFormat=VJSON&estOnly=Y"
			
			$.getScript(apiUrl, function() {
				evalData = EVALIDatorOutput;
				drawFeatureLayer(evalData, idAttr, estVar);
			});
					
			
			// wire up the tip
			//fl.on("mouse-over", window.tip.showInfo);
			//fl.on("mouse-out", window.tip.hideInfo);
		});

		map.addLayer(fl);

		
		function parseRow(data){
			var outTab = [];
			var rl = data.row;
			rl.forEach(function(r){
				if(r.content !== "Total"){
					var newRow = {};
					newRow["row"] = r.content;
					r.column.forEach(function(c){
						if(c.content !== "Total"){
							var dataPoint = c.cellValueNumerator;
							if(isNaN(dataPoint)){dataPoint = 0;}
							if(isNaN(c.cellSE) || c.hasOwnProperty('cellSE') == false){
								var dataError = 0;
							}else{
								var dataError = c.cellSE;
							}
							newRow[c.content] = [dataPoint,dataError];
						}
					});
				outTab.push(newRow);
				}
			});	
			return outTab;
		}
			
		function drawFeatureLayer(data, idAttr, estVar) {
			estData = parseRow(data);
			
			//loop through to find the domain of the estimates
			var estMax = Math.max(...estData.map(function(d){return d[estVar][0];}));
			var estMin = Math.min(...estData.map(function(d){return d[estVar][0];}));
			
			//collect an object of format feature = est
			var featureEst = {};
			estData.map(function(d) {featureEst[d.row] = d[estVar][0];});
			
			// add an attribute to each attribute so estimate is displayed
			// on mouse over below the legend
			//Doesn't seem to work with extras/Tip not working
			
			fl.graphics.forEach(function(g) {
				if(featureEst.hasOwnProperty(g.attributes[idAttr])){
					var displayValue = featureEst[g.attributes[idAttr]];
				}else{
					var displayValue = 0;
				}
				g.attributes.estDisplay = displayValue;
			});

			var renderer = new SimpleRenderer(new SimpleFillSymbol().setOutline(new SimpleLineSymbol().setWidth(0.1).setColor(new Color([128,128,128,0]))));
			renderer.setColorInfo({
				field: "estDisplay",
				minDataValue: estMin,
				maxDataValue: estMax,
				colors: [
					new Color([255, 255, 255, 0.80]),
					new Color([127, 127, 0, 0.80])
				]
			});
			fl.setRenderer(renderer);
			fl.redraw();

			var legend = new Legend({
			  map: map,
			  layerInfos: [{ "layer": fl, "title": estVar }]
			},"legend");
			legend.startup();        
		}
	});
}

//var estVar = "Accessible forest";
function updateRenderer(estVar){
	require(["esri/Color",
		"esri/symbols/SimpleLineSymbol",
		"esri/symbols/SimpleFillSymbol",
		"esri/renderers/SimpleRenderer"]), 
		function(Color, SimpleLineSymbol, SimpleFillSymbol, SimpleRenderer) {
		console.log("chuck yeah motherchuckers!");	
		var estMax = Math.max(...estData.map(function(d){return d[estVar][0];}));
		var estMin = Math.min(...estData.map(function(d){return d[estVar][0];}));
		
		//collect an object of format feature = est
		var featureEst = {};
		estData.map(function(d) {featureEst[d.row] = d[estVar][0];});
		
		// add an attribute to each attribute so estimate is displayed
		// on mouse over below the legend
		//Doesn't seem to work with extras/Tip not working
		
		fl.graphics.forEach(function(g) {
			if(featureEst.hasOwnProperty(g.attributes[idAttr])){
				var displayValue = featureEst[g.attributes[idAttr]];
			}else{
				var displayValue = 0;
			}
			g.attributes.estDisplay = displayValue;
		});
		
		var renderer = new SimpleRenderer(new SimpleFillSymbol().setOutline(new SimpleLineSymbol().setWidth(0.1).setColor(new Color([128,128,128,0]))));
		renderer.setColorInfo({
			field: "estDisplay",
			minDataValue: estMin,
			maxDataValue: estMax,
			colors: [
				new Color([255, 255, 255, 0.80]),
				new Color([127, 127, 0, 0.80])
			]
		});
		fl.setRenderer(renderer);
		fl.redraw();
	}
}