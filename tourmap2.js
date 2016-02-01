var map;
require(["esri/map", "dojo/domReady!"], function(Map) {
	var ext = new esri.geometry.Extent(-8150997.290034163,5114313.897338178,-8149842.374310014,5115379.238419812,new esri.SpatialReference({wkid: 102100, latestWkid: 3857}));
	map = new Map("mapDiv", {
		extent: ext,
		basemap: "hybrid"
	});
});

var myScroll;
function loaded() {
	var wrapper = document.getElementById('wrapper');
	var scroller = document.createElement("div");
	scroller.setAttribute("id","scroller");
	var theList = document.createElement("ul");
	theList.setAttribute("id","thelist");
	scroller.appendChild(theList);
	wrapper.appendChild(scroller);
	var sList = new Array();
	for (i in stories){
		var li = document.createElement("li");
		var id = stories[i].id;
		var pic = stories[i].img;
		var imgCont = document.createElement("div");
		imgCont.setAttribute("class","imgThumbContainer");
		var imgMedia = document.createElement("img");
		imgMedia.setAttribute("src",'Images/'+pic);
		imgMedia.setAttribute("id",id);
		imgMedia.setAttribute('ondblclick',"thumbClick(this.id)");
		imgCont.appendChild(imgMedia);
		li.appendChild(imgCont);
		theList.appendChild(li);
		sList.push(i);
	}
	scroller.setAttribute("width",Math.max(sList.length * 50,200) + "%");
	myScroll = new iScroll('wrapper');
}

document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);
document.addEventListener('DOMContentLoaded', loaded, false);



var thumbClick = function(cid) {
	rec = stories[cid];
	
	var imgMedia = document.getElementById("imgMedia");
	imgMedia.src = "Images/" + rec.img;
	
	map.centerAndZoom(rec.cent,rec.zoom);
	document.getElementById("content").innerHTML = rec.content;
	
}	