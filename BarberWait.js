//credit to Xavier John of stackoverflow
//http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
function exportToCsv(filename, rows) {
        var processRow = function (row) {
            var finalVal = '';
            for (var j = 0; j < row.length; j++) {
                var innerValue = row[j] === null ? '' : row[j].toString();
                if (row[j] instanceof Date) {
                    innerValue = row[j].toLocaleString();
                };
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0)
                    result = '"' + result + '"';
                if (j > 0)
                    finalVal += ',';
                finalVal += result;
            }
            return finalVal + '\n';
        };

        var csvFile = '';
        for (var i = 0; i < rows.length; i++) {
            csvFile += processRow(rows[i]);
        }

        var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) { // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            var link = document.createElement("a");
            if (link.download !== undefined) { // feature detection
                // Browsers that support HTML5 download attribute
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }

function checkWait(){
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
	})
	var w = document.getElementsByTagName("rect");
	var b = document.getElementsByTagName("strong");
	var c = document.getElementsByTagName("circle");

	var wait = 0;
	for(var i = 0; i < wait.length; i++){
		if(w[i].getAttribute("fill") == "black"){
			wait++;
		}
	}

	var chairs = 0;
	for(var i = 0; i < c.length; i++){
		if(w[i].getAttribute("fill") == "black"){
			chairs++;
		}
	}

	var barbers = 0;
	for(var i = 0; i < b.length; i++){
		if(w[i].getAttribute("fill") == "black"){
			barbers++;
		}
	}
	return([barbers,wait,chairs]);
}