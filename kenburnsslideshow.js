var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
    }
};

var resizeSlideshow = function() {
	var width = document.body.clientWidth;
	var height = document.body.clientHeight;
	if(width <= height*1.5){
		var newWidth = width;
		var newHeight = width*(2/3);
	}else{
		var newWidth = height*1.5;
		var newHeight = height;
	}
	document.getElementById('slideshow').style.height = height;
	document.getElementById('slideshow').style.width = width;
};
/**
 * See: http://www.css-101.org/articles/ken-burns_effect/css-transition.php
 */

/**
 * The idea is to cycle through the images to apply the "fx" class to them every n seconds. 
 * We can't simply set and remove that class though, because that would make the previous image move back into its original position while the new one fades in. 
 * We need to keep the class on two images at a time (the two that are involved with the transition).
 */

(function(){

// we set the 'fx' class on the first image when the page loads
  document.getElementById('slideshow').getElementsByTagName('img')[0].className = "fx";
  
// this calls the kenBurns function every 4 seconds
// you can increase or decrease this value to get different effects
  window.setInterval(kenBurns, 7000);		
  
// the third variable is to keep track of where we are in the loop
// if it is set to 1 (instead of 0) it is because the first image is styled when the page loads
  var images          = document.getElementById('slideshow').getElementsByTagName('img'),
      numberOfImages  = images.length,
      i               = 1;

	  
  function kenBurns() {
  if(i==numberOfImages){ i = 0;}
  images[i].className = "fx";

// we can't remove the class from the previous element or we'd get a bouncing effect so we clean up the one before last
// (there must be a smarter way to do this though)
  if(i===0){ images[numberOfImages-2].className = "";}
  if(i===1){ images[numberOfImages-1].className = "";}
  if(i>1){ images[i-2].className = "";}
  i++;

  }
})();

//addEvent(window, "resize", resizeSlideshow);