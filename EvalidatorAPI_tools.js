// Utility functions
function returnStringArray(elementArray){
	
	var els = elementArray;
	var out = [];
	for(i = 0; i < els.length; i++){
		out.push(els[i].textContent.trim());
	}
	return out;
}
function print(stuff){console.log(stuff);}

///////////////////////////////////////////////////////////////////////////////////
//parse page variables before passing array onto parseRow()
var parsePage = function(data){
	var outObject = [];
	var pl = data.page;
	pl.forEach(function(p){
		var pTab = parseRow(p);
		outObject.push(pTab);
	});
	console.log(outObject);
	return outObject;
}

//parse row variables into object full of row values
var parseRow = function(data){
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

//parse api returned html formatted results (page variables currently not allowed
function parseHTMLtoJSON(){
		var evalJson = {};
	evalJson.row = [];
	var tables = document.getElementById("container").getElementsByTagName("table");
	
	//Iterate through tables in document
	for(var t = 0; t < tables.length; t++){
		var capList = tables[t].getElementsByTagName("caption");
		if(capList.length > 0){
			var caption = capList[0].textContent;
			if (caption === "Estimate:"){
				var rows = tables[t].getElementsByTagName("tr");
				evalJson.columnVariable = rows[0].textContent.trim();
				evalJson.rowVariable = tables[t].getElementsByTagName("th")[0].textContent;
				var colNames = returnStringArray(rows[1].getElementsByTagName("td"));
				
				//Iterate through rows in table to put together a row object
				for(var r = 2; r < rows.length; r++){
					var rowJson = {"column":[]};
					var rowData = rows[r].getElementsByTagName("td");
					rowJson.content = rowData[0].textContent;
						
					//Iterate through items in row to put together a single item record
					for(var rd = 1; rd < rowData.length; rd++){
						var colJson = {};
						var cellValue = Number(rowData[rd].textContent.replace(/\,/g,''));
						if(isNaN(cellValue)){cellValue = 0;}
						colJson.cellValueNumerator = cellValue;
						colJson.content = colNames[rd-1];
						rowJson.column.push(colJson);
					}
					evalJson.row.push(rowJson);
				}
				
			}else if (caption === "Sampling error percent:"){
				var rows = tables[t].getElementsByTagName("tr");
				var colNames = returnStringArray(rows[1].getElementsByTagName("td"));
				
				//Iterate through rows in table to put together a row object
				for(var r = 2; r < rows.length; r++){
					var rowData = rows[r].getElementsByTagName("td");
					var rowName = rowData[0].textContent;
						
					//Iterate through items in row to append to correct item
					for(var rd = 1; rd < rowData.length; rd++){
						var cellValue = Number(rowData[rd].textContent.replace(/\,/g,''));
						if(isNaN(cellValue)){cellValue = 0;}
						evalJson.row.filter(function(d){return d.content === rowName})[0].column.filter(function(d){return d.content === colNames[rd-1]})[0].cellSE = cellValue;
					}
				}
			}else if (caption === "Number of non-zero plots in estimate:"){
				var rows = tables[t].getElementsByTagName("tr");
				var colNames = returnStringArray(rows[1].getElementsByTagName("td"));
				
				//Iterate through rows in table to put together a row object
				for(var r = 2; r < rows.length; r++){
					var rowData = rows[r].getElementsByTagName("td");
					var rowName = rowData[0].textContent;
						
					//Iterate through items in row to append to correct item
					for(var rd = 1; rd < rowData.length; rd++){
						var cellValue = Number(rowData[rd].textContent.replace(/\,/g,''));
						if(isNaN(cellValue)){cellValue = 0;}
						evalJson.row.filter(function(d){return d.content === rowName})[0].column.filter(function(d){return d.content === colNames[rd-1]})[0].cellPlotNumerator = cellValue;
					}
				}
			}
		}
	}
	return(evalJson);
}

///////////////////////////////////////////////////////////////////////////////////
//generate api address
function genApiUrl(states, num, den, dims, errorEst){
	if(states.length > 0){
		apiUrl = "http://zlphefido001.phe.fs.fed.us/EvalidatorGRM/batcheval.jsp?reptype=State&lat= 0&lon= 0&radius= 0" + 
		"&snum=" + num + 
		"&sdenom=" + den +
		"&wc=" + states +
		"&pselected=" + dims.page + 
		"&rselected=" + dims.row +
		"&cselected=" + dims.col +
		"&ptime=Current&rtime=Current&ctime=Current&wf=&wnum=&wnumdenom=&schemaName=FS_FIADB.&outputFormat=VJSON&" +
		"estOnly=" + errorEst;
		console.log(apiUrl);
		return(apiUrl);
	}
}

//generate api address with html output
function genApiUrl_html(states, num, den, dims, errorEst){
	if(states.length > 0){
		apiUrl = "http://apps.fs.fed.us/Evalidator/batcheval.jsp?reptype=State&lat= 0&lon= 0&radius= 0" + 
		"&snum=" + num + 
		"&sdenom=" + den +
		"&wc=" + states +
		"&pselected=" + dims.page + 
		"&rselected=" + dims.row +
		"&cselected=" + dims.col +
		"&ptime=Current&rtime=Current&ctime=Current&wf=&wnum=&wnumdenom=&schemaName=FS_FIADB."
		console.log(apiUrl);
		return(apiUrl);
	}
}

///////////////////////////////////////////////////////////////////////////////////

function queryAPI(apiUrl, callbackFunction, adnlParams){
	$.getScript(apiUrl, function() {
		if(EVALIDatorOutput.hasOwnProperty("page")){ 
			var dataSetList = parsePage(EVALIDatorOutput);
			evalData = dataSetList;
		}else if(EVALIDatorOutput.hasOwnProperty("row")){ 
			var data = parseRow(EVALIDatorOutput);
			evalData = data;
		}
		callbackFunction(evalData);
	});	
}

function queryAPI_HTML(apiUrl, callbackFunction){
	apiUrl = "https://crossorigin.me/" + apiUrl;
	$.get(apiUrl, function(data) {
		if(document.getElementById("container") == null){
			var container = document.createElement("div");
			container.setAttribute("id","container");
			container.style.height="0px";
			container.style.width="0px";
			container.style.visibility = "hidden";
			container.innerHTML = String(data);
			document.getElementsByTagName("body")[0].appendChild(container);
		}else{
			container = document.getElementById("container");
			container.innerHTML = String(data);
		}
		
		evalData = parseRow(parseHTMLtoJSON(data));
		//console.log(evalData);
		callbackFunction(evalData);
	});	
}








