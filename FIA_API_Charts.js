var apiOutput;
///////////////////////////////////////////////////////////////////////////////////
//Populate page
//Generate dropdown options based on json inputs
function fillStateSelector(){
	d3.json('stateFipsCodes.json', function(error, json) {
		if (error) return console.warn(error);
		stateFips = json;
		stateFips.forEach(function(state) {
			var opt = document.createElement("option");
			opt.setAttribute("value",state.FIPS);
			opt.innerHTML = state.STATE;
			document.getElementById("stateSelect").appendChild(opt);	
		});
	});
}

function fillAttributeSelector(dim){
	d3.json('evalidator_variable_library.json', function(error, json) {
		if (error) return console.warn(error);
		dimOptions = json;
		dimOptions.map(function(d){if(d[dim + "Class"] == "Y"){
			var opt = document.createElement("option");
			opt.setAttribute("value",d.className);
			opt.setAttribute("class","dimOpt " + d.classTab);
			opt.innerHTML = d.className;
			document.getElementById(dim+"Select").appendChild(opt);	
		}});
	});
}

function fillEstimateSelector(part){
	d3.json('evalidator_estimate_library.json', function(error, json) {
		if (error) return console.warn(error);
		ests = json;
		var optGrpSet = new Set();
		var optGrpNumSet = new Set();
		ests.map(function(est) {optGrpSet.add(est.estGroup);});
		ests.map(function(est) {optGrpNumSet.add(est.estGroupNum);});
		var optGrpList = [];
		optGrpNumSet.forEach(function(d){optGrpList.push(Array.from(optGrpSet)[Number(d)-1]);});
		optGrpList.forEach(function(optGrpName) {
			var optGrp = document.createElement("optgroup"); 
			optGrp.setAttribute("label",optGrpName);
			optGrp.setAttribute("id",optGrpName);
			optGrp.innerHTML = optGrpName;
			document.getElementById(part+"Select").appendChild(optGrp);
		});
		ests.map(function(est) {
			var opt = document.createElement("option");
			opt.setAttribute("value",est.estDesc);
			opt.setAttribute("class",part+"Est" + " " + est.estTab);
			//Disable denominator options for now
			if(part == "den"){
				opt.disabled = true;;
				opt.setAttribute("font-color","grey");
			}
			opt.innerHTML = est.estDesc;
			document.getElementById(est.estGroup).appendChild(opt);
		});
	});
}

function fillSelectors(){
	fillStateSelector();
	fillAttributeSelector("page");	
	fillAttributeSelector("row");	
	fillAttributeSelector("col");
	fillEstimateSelector("den");
	fillEstimateSelector("num");
}

///////////////////////////////////////////////////////////////////////////////////
//limit page, row, and columns options based on estimation selection 
//currently not working JDG 3/1/2016
function limitDims(part){
	var estTab = genEsts(part)[1];
	var opts = document.getElementsByClassName("dimOpt");
	for(var i = 0; i < opts.length; i++){
		if(opts[i].value != "None"){
			opts[i].disabled = true;
			if(opts[i].selected){opts[i].selected=false;};
		}
	}
	opts = document.getElementsByClassName("dimOpt " + estTab);
	for(var i = 0; i < opts.length; i++){
		opts[i].disabled = false;
	}
}

///////////////////////////////////////////////////////////////////////////////////
//Collect selection from each of the dropdowns
function genStates(){
	var selectedStates = [];
	var opts = document.getElementById('stateSelect').childNodes;
	for(var i = 0; i < opts.length; i++){
		if(opts[i].selected){
			var val = opts[i].value.split(",");
			val.map(function(v) {selectedStates.push(v + "2014")});
		}
	}
	//console.log(selectedStates.join());
	return selectedStates.join();
}

function genDims(){
	var selectedDims = {"page":"None","row":"None","col":"None"};
	for(dim in selectedDims){
		var opts = document.getElementById(dim+'Select').childNodes;
		for(var i = 0; i < opts.length; i++){
			if(opts[i].selected){
				selectedDims[dim] = opts[i].value;
			}
		}
	}	
	return selectedDims;
}

function genEsts(part){
	var opts = document.getElementsByClassName(part+"Est");
	for(var i = 0; i < opts.length; i++){
		if(opts[i].selected){
			return [opts[i].value,opts[i].className.split(" ")[1]];
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////
//Submit options to API address generator
function generateURL(){
	var states = genStates();
	var dims = genDims();
	var num = genEsts("num")[0];
	var den = genEsts("den")[0];	
	var errorEst = $('input[name=errorEstimate]:checked').val();
	var apiUrl = genApiUrl(states, num, den, dims, errorEst);
	//var apiUrl = genApiUrl_html(states, num, den, dims, errorEst);
	return apiUrl;
}

//Clear charts on new submission
function clearVisWindow(){
	document.getElementById("visWindow").innerHTML = "";
}

function updateVisWindow(){
	clearVisWindow();
	var apiUrl = generateURL();
	//apiUrl = "SR003.js";
	queryAPI(apiUrl,addChart);

	//Option for when lupe isn't working
	//queryAPI_HTML(apiUrl,addChart)
}

function addChart(evalData){
	var elementId = "#visWindow";
	appendSVG(evalData,elementId,genEsts("num")[0]);
	apiOutput = evalData;
	return apiOutput;
}

