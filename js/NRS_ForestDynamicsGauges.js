function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
				x = text.attr("x"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
				++lineNumber;
      }
    }
  });
}

function labelGauge(gauge,labels){
	var width = gauge[0][0].clientWidth;
	var height = gauge[0][0].clientHeight;
	gauge.append("text")
	.attr("x",width * 0.17)
	.attr("y",height * 0.38)
	.attr("dx",0)
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.text(labels.left);
	
	gauge.append("text")
	.attr("x",width * 0.75)
	.attr("y",height * 0.38)
	.attr("dx",0)
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.text(labels.right);
	
	gauge.append("text")
	.attr("x",width * 0.46)
	.attr("y",height * 0.14)
	.attr("dx",0)
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.text(labels.top);

	gauge.append("text")
	.attr("x",width * 0.2)
	.attr("y",height * 0.67)
	.attr("dx",0)
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.text(labels.minVal);	

	gauge.append("text")
	.attr("x",width * 0.72)
	.attr("y",height * 0.67)
	.attr("dx",(-labels.maxVal.length))
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.text(labels.maxVal);	
	
	var readout = gauge.append("text")
	.attr("x",width * 0.46)
	.attr("y",height * 0.8)
	.attr("dx",0)
	.attr("dy",0)
	.attr("text-anchor", "middle")
	.attr("class","readout")
	.text("");
	
	wrap(gauge.selectAll("text"),10);
	
	return readout;
}

function initGauge(gaugeDef){

	var barWidth, chart, chartInset, degToRad,
    height, margin, numSections, padRad, percToDeg, percToRad, 
    val, radius, sectionIndx, svg, totalPercent, width, percHolder, colors,
		innerRadius, outerRadius;
		
	var targetEl = gaugeDef.target;
	var sections = gaugeDef.segments;
	var val = gaugeDef.initVal;
	var labels = gaugeDef.labels;
	
  numSections = sections.length;
  sectionPerc = sections;
	sumRange = sections.reduce(function(a,b){return a+b});
  padRad = 0.025;
  chartInset = 0;
	var gaugeScale = d3.scale.linear();
				gaugeScale.domain(gaugeDef.domain);
				gaugeScale.range([0,1]);

  // Orientation of gauge:
  totalPercent = 0.65;

  el = d3.select(targetEl);

  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 20
  };

	nTicks = 0;
	//console.log(el[0][0].offsetWidth);
  //width = el[0][0].offsetWidth - margin.left - margin.right;
  width = 220;
	height = width;
  radius = Math.min(width, height) / 2;
  barWidth = 12 * width / 300;
	colors = ['rgb(165,0,38)','rgb(215,48,39)','rgb(244,109,67)','rgb(253,174,97)','rgb(254,224,144)','rgb(224,243,248)','rgb(171,217,233)','rgb(116,173,209)','rgb(69,117,180)','rgb(49,54,149)']
	
	outerRadius = radius - chartInset;
	innerRadius = radius-chartInset-barWidth;
	
  /*
    Utility methods 
  */
  percToDeg = function(perc) {
    return perc * 360;
  };

  percToRad = function(perc) {
    return degToRad(percToDeg(perc));
  };

  degToRad = function(deg) {
    return deg * Math.PI / 180;
  };

  // Create SVG element
  svg = el.append('svg').attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);

  // Add layer for the panel
  chart = svg.append('g').attr('transform', "translate(" + ((width + margin.left) / 2) + ", " + ((height + margin.top) / 2) + ")");
	for (sectionIndx = i = 1, ref = numSections; 1 <= ref ? i <= ref : i >= ref; sectionIndx = 1 <= ref ? ++i : --i) {
		arcStartRad = percToRad(totalPercent);
		arcEndRad = arcStartRad + percToRad(sectionPerc[i-1]);
		totalPercent += sectionPerc[i-1];
		startPadRad = sectionIndx === 0 ? 0 : padRad / 2;
		endPadRad = sectionIndx === numSections ? 0 : padRad / 2;
		arc = d3.svg.arc().outerRadius(outerRadius).innerRadius(innerRadius).startAngle(arcStartRad + startPadRad).endAngle(arcEndRad - endPadRad);
		chart.append('path').attr('class', 'arc chart-color' + sectionIndx).attr('d', arc).attr("fill",colors[i]);
	}
	
	//add labels
	var readout = labelGauge(svg,labels);
	
  var Needle = (function() {

    /** 
      * Helper function that returns the `d` value
      * for moving the needle
    **/
    var recalcPointerPos = function(perc) {
      var centerX, centerY, leftX, leftY, rightX, rightY, thetaRad, topX, topY;
      thetaRad = percToRad(perc * sumRange) + percToRad(sumRange + 0.20);
      centerX = 0;
      centerY = 0;
      topX = centerX - (this.len * Math.cos(thetaRad));
      topY = centerY - (this.len * Math.sin(thetaRad));
      leftX = centerX - this.radius * Math.cos(thetaRad - Math.PI / 2);
      leftY = centerY - this.radius * Math.sin(thetaRad - Math.PI / 2);
      rightX = centerX - this.radius * Math.cos(thetaRad + Math.PI / 2);
      rightY = centerY - this.radius * Math.sin(thetaRad + Math.PI / 2);
			//console.log("M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY);
      return "M " + leftX + " " + leftY + " L " + topX + " " + topY + " L " + rightX + " " + rightY;
    };

    function Needle(el) {
      this.el = el;
			this.gauge = targetEl;
      this.len = width / 2.5;
      this.radius = this.len / 20;
			this.gaugeScale = gaugeScale;
			this.perc = 0;
    }

    Needle.prototype.render = function() {
      this.el.append('circle').attr('class', 'needle-center').attr('cx', 0).attr('cy', 0).attr('r', this.radius);
      return this.el.append('path').attr('class', 'needle').attr('d', recalcPointerPos.call(this, 0));
    };

		Needle.prototype.moveTo = function(val) {	
			perc = this.gaugeScale(val);
			if(perc > 1){perc=1}else if(perc<0){perc=0};
			var oldPerc = this.perc;
			//console.log(oldPerc + " to " + perc);
      this.perc = perc;
			var diff = perc - oldPerc;
      var self = this;
			//move pointer to new position
			this.el.select(".needle").transition().delay(300).ease('linear').duration(300).attr("d",recalcPointerPos.call(self,oldPerc+diff/2)).transition().delay(300).ease('linear').duration(300).attr("d",recalcPointerPos.call(self,oldPerc+diff));
    };
    return Needle;
  })();

	svg.needle = new Needle(chart);
	svg.needle.render();
	svg.readout = readout;
	svg.range = sumRange;
	gaugeDef.gauge = svg;
}

//var gauges = [];
var pfg = {
	target:"#gauge1",
	segments:[0.14,0.14,0.14,0.14,0.14],
	initVal:0.5,
	domain:[0.0,1],
	labels:{top:"50%",left:"Less Forest",right:"More Forest",minVal:"0%",maxVal:"100%"},
	statistic:"fields.FOR13AC/(fields.Shape_Area*0.0002471044)",
	readoutStat:"fields.FOR13AC + ' acres'"
}

var fchg = {
	target:"#gauge2",
	segments:[0.335,0.03,0.335],
	initVal:0.0,
	domain:[-0.01,0.01],
	labels:{top:"<0.1% Change",left:"Forest Loss",right:"Forest Gain",minVal:"-1%",maxVal:"1%"},
	statistic:"fields.F13netanac/fields.FOR13AC",
	readoutStat:"((fields.F13netanac/fields.FOR13AC)*100).toFixed(2) + '%'"
}

var fdg = {
	target:"#gauge3",
	segments:[0.14,0.14,0.14,0.14,0.14],
	initVal:1,
	domain:[0,0.2],
	labels:{top:"10%",left:"4%",right:"16%",minVal:"0%",maxVal:"20%"},
	statistic:"fields.C_D13ANAC/fields.FOR13AC",
	readoutStat:"((fields.C_D13ANAC/fields.FOR13AC)*100).toFixed(2) + '%'"
}

var gauges = [pfg,fchg,fdg];
//gauges.push(fchg);
//gauges.push(pfg);
//gauges.push(fdg);



