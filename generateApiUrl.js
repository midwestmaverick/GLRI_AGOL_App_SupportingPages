// arguments: reference to select list, callback function (optional)
function genApiUrl(){
	var selectedStates = [];
	var opts = document.getElementById('stateSelect').childNodes;
	for(var i = 0; i < opts.length; i++){
		if(opts[i].selected){
			console.log(opts[i].value+"2014");
			selectedStates.push(opts[i].value + "2014");
		}
	}
	console.log(selectedStates.join());

	
	
	return false; // don't return online form
}

function clearCharts(){
	Array.prototype.slice.call(document.getElementsByTagName('svg')).forEach(
	  function(item) { item.parentNode.removeChild(item); 
	});
}