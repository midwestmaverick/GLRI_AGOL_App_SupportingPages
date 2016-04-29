function sV(t, e) {
    return t[e.valField] * e.scalingFactor
}

function Timer(t) {
    this.msg = t.callee.name, this.count = 1, this.start = function() {
        this.startTime = (new Date).getTime()
    }, this.stop = function() {
        console.log(this.msg + " stop " + this.count + ": " + parseInt((new Date).getTime() - this.startTime) + "ms"), this.count++
    }
}

function intF(t) {
    return numF(parseInt(t))
}

function componentToHex(t) {
    var e = t.toString(16);
    return 1 == e.length ? "0" + e : e
}

function rgbToHex(t) {
    return "#" + componentToHex(t[0]) + componentToHex(t[1]) + componentToHex(t[2])
}

function appendLyrScales(t) {
    t.valScale = d3.scale.linear().domain([0, 1]).range(t.stops), t.sizeScale = d3.scale.linear().domain(t.stops).range(t.symbolSizes), t.colScale = d3.scale.linear().domain(t.stops).range(t.colors.map(function(t) {
        return rgbToHex(t)
    }))
}

function scaleSymbSize(t) {
    return .5 * (t + t * (map.getZoom() - map.getMinZoom()))
}

function setColStops(t) {
    var e = [];
    return t.stops.map(function(r, a) {
        e.push({
            value: r,
            color: new esri.Color(t.colors[a])
        })
    }), e
}

function genRange(t, e, r) {
    for (var a = new Array, n = t; e >= n; n += r) a.push(n);
    return a
}

function getRange(t) {
    return d3.max(t) - d3.min(t)
}

function getRangeArray(t) {
    return [d3.min(t), d3.max(t)]
}

function getDataRangeArray(t) {
    t.map(function(t) {
        return t
    })
}

function getLyrs() {
    var t = {
        X: layerDefs.filter(function(t) {
            return t.title == $("#lX").text()
        })[0],
        Y: layerDefs.filter(function(t) {
            return t.title == $("#lY").text()
        })[0]
    };
    return t
}

function highlightPoints(t) {
    var e = new Timer(arguments);
    e.start();
    var a = getLyrs();
    d3.select("#map_layers").selectAll("circle").filter(function(e) {
        return this.getAttribute("data-" + featureId) == t ? this : void 0
    }).attr("id", "mapHighlight");
    var n = d3.selectAll(".dot").filter(function(e) {
        return e[featureId] == t
    }).datum();
    d3.select(".objects").append("circle").attr("id", "chartHighlight").attr("r", r(n.PctFor2008)).attr("transform", transform(n[a.X.valField], n[a.Y.valField])).on("mouseout", unhighlightPoints), d3.select("#forestCounter").text(intF(n.For2008)), d3.select("#xCounter").text(intF(n[a.X.sumField])), d3.select("#yCounter").text(intF(n[a.Y.sumField])), d3.select("#xPer").text(perF(n[a.X.sumField] / n.For2008)), d3.select("#yPer").text(perF(n[a.Y.sumField] / n.For2008)), d3.select("#pCounter").text(numF(n.Tot_plots)), e.stop()
}

function unhighlightPoints() {
    var t = new Timer(arguments);
    t.start(), d3.select("#map_layers").selectAll("circle").attr("id", ""), d3.selectAll("#chartHighlight").remove(), d3.select("#forestCounter").text(intF(sumVals.f)), d3.select("#xCounter").text(intF(sumVals.vx)), d3.select("#yCounter").text(intF(sumVals.vy)), d3.select("#xPer").text(perF(sumVals.vx / sumVals.f)), d3.select("#yPer").text(perF(sumVals.vy / sumVals.f)), d3.select("#pCounter").text(numF(sumVals.p)), t.stop()
}

function initMapHighlight() {
    var t = new Timer(arguments);
    t.start(), $("circle", $("#map_layers")).mouseover(function() {
        highlightPoints(this.getAttribute("data-" + featureId))
    }), $("circle", $("#map_layers")).mouseout(function() {
        unhighlightPoints()
    }), t.stop()
}

function counterRow(t, e) {
    d3.select("#counters").append("tr").append("td").attr("width", "70%").append("text").attr("id", t).style({
        "font-size": "110%",
        "text-align": "left"
    }).text(e)
}

function counterData(t, e) {
    d3.select("#counters").selectAll("tr").last().append("td").attr("class", "counterData").attr("width", "20%").append("text").attr("id", t).style({
        "font-size": "110%"
    }).text(e)
}

function addUnits(t, e) {
    d3.select(t).select(function() {
        return this.parentNode
    }).append("text").attr("class", "counterUnits").text(e)
}

function initCounters() {
    var t = new Timer(arguments);
    t.start(), lds = getLyrs(), counterRow("fcTitle", "Forested Acres:"), counterData("forestCounter", intF(sumVals.f)), d3.select("#counters").append("tr").style("height", "10px"), counterRow("xCTitle", lds.X.title + ":"), counterData("xCounter", intF(sumVals.vx)), counterRow("xCPerTitle", "(% of Forest:)"), counterData("xPer", perF(sumVals.vx / sumVals.f)), d3.select("#counters").append("tr").style("height", "10px"), counterRow("yCTitle", lds.Y.title + ":"), counterData("yCounter", intF(sumVals.vy)), counterRow("xCPerTitle", "(% of Forest:)"), counterData("yPer", perF(sumVals.vy / sumVals.f)), d3.select("#counters").append("tr").style("height", "10px"), counterRow("pTitle", "FIA Plot count:"), counterData("pCounter", sumVals.p), addUnits("#forestCounter", "ac"), addUnits("#xCounter", "ac"), addUnits("#yCounter", "ac"), t.stop()
}

function updateIntCounter(t, e) {
    var r = new Timer(arguments);
    r.start();
    var a = parseInt($(t).text().replace(/,/g, ""));
    d3.select(t).transition().duration(1e3).tween("text", function(t) {
        var r = d3.interpolate(a, e);
        return function(t) {
            d3.select(this).text(intF(r(t)))
        }
    }), r.stop()
}

function updatePerCounter(t, e) {
    var r = new Timer(arguments);
    r.start(), oldVal = .01 * parseFloat($(t).text().replace("(", "").replace(")", "").replace(/,/g, "")), d3.select(t).transition().duration(1e3).tween("text", function(t) {
        var r = d3.interpolate(oldVal, e);
        return function(t) {
            d3.select(this).text("(" + perF(r(t)) + ")")
        }
    }), r.stop()
}

function sumVar() {
    var t = new Timer(arguments);
    t.start();
    var e = map.extent,
        r = getLyrs();
    return sumVals.f = 0, sumVals.vx = 0, sumVals.vy = 0, sumVals.p = 0, map.getLayer("lyrX").graphics.filter(function(t) {
        return inRange(t.geometry.x, [e.xmin, e.xmax]) && inRange(t.geometry.y, [e.ymin, e.ymax]) && inRange(t.attributes[r.X.valField], x.domain()) && inRange(t.attributes[r.Y.valField], y.domain())
    }).map(function(t) {
        sumVals.f += parseFloat(t.attributes.For2008), sumVals.vx += parseFloat(t.attributes[r.X.sumField]), sumVals.vy += parseFloat(t.attributes[r.Y.sumField]), sumVals.p += parseInt(t.attributes.Tot_plots)
    }), sumVals
}

function updateAllCounters(t) {
    var e = new Timer(arguments);
    e.start(), updateIntCounter("#forestCounter", parseInt(t.f)), updateIntCounter("#xCounter", parseInt(t.vx)), updateIntCounter("#yCounter", parseInt(t.vy)), updateIntCounter("#pCounter", parseInt(t.p)), 0 == t.f ? (vx = 0, vy = 0) : (vx = t.vx / t.f, vy = t.vy / t.f), updatePerCounter("#xPer", vx), updatePerCounter("#yPer", vy), e.stop()
}

function selectLayers(t) {
    var e = new Timer(arguments);
    e.start(), console.log("select:" + t);
    var r = ($("#l" + t).text(), getLyrs()),
        a = map.getLayer("lyr" + t),
        n = new esri.symbol.SimpleMarkerSymbol;
    n.outline.setWidth(0), n.setSize(0);
    var i = new esri.renderer.SimpleRenderer(n);
    i.setColorInfo({
        field: r[t].colField,
        stops: setColStops(r[t])
    }), a.setRenderer(i), a.redraw(), customLegend($("#l" + t), r[t].legendOrder);
    x.domain(getRangeArray(r.X.minMax)), y.domain(getRangeArray(r.Y.minMax)), d3.selectAll(".dot").transition().duration(200).delay(function(t, e) {
        return .5 * e
    }).attr("transform", function(t) {
        return transform(t[r.X.valField], t[r.Y.valField])
    }), d3.select(".x.axis").transition().duration(1e3).call(xAxis), d3.select(".y.axis").transition().duration(1e3).call(yAxis), d3.select("#xAxisLabel").text(r.X.title), d3.select("#yAxisLabel").text(r.Y.title), zoomBeh.x(x), zoomBeh.y(y), d3.select("#xCTitle").text(r.X.title + ":"), d3.select("#yCTitle").text(r.Y.title + ":"), updateAllCounters(sumVar()), scaleLegend(), renderMapBasedOnChart(), e.stop()
}

function swipeTransform() {
    var t = $("#map").width(),
        e = $("#swipeHandle"),
        r = e.position().left - e.parent().position().left + .5 * e.width();
    try {
        var a = $("#map_graphics_layer"),
            n = a[0].transform.animVal.getItem(0).matrix,
            i = -1 * (n.e + 3),
            s = -1 * n.f;
        d3.select("#clip1rect").attr("width", r).attr("transform", "translate(" + i + "," + s + ")"), d3.select("#clip2rect").attr("x", r).attr("width", t - r).attr("transform", "translate(" + i + "," + s + ")")
    } catch (i) {}
}

function initSwipe() {
    var t = new Timer(arguments);
    t.start();
    var e = $("#map")[0],
        r = $("#map").width(),
        a = (e.offsetHeight, $("#swipeHandle").position().left),
        n = d3.select("#map_gc");
    n.append("svg:clipPath").attr("id", "gfx_clip1").append("svg:rect").attr("id", "clip1rect").attr("x", "0").attr("y", "0").attr("width", a).attr("height", "100%"), n.append("svg:clipPath").attr("id", "gfx_clip2").append("svg:rect").attr("id", "clip2rect").attr("x", a).attr("y", "0").attr("width", r - a).attr("height", "100%");
    $("#swipeHandle").draggable({
        axis: "x",
        containment: "parent",
        drag: swipeTransform
    }), $("#swipeZone").height($("#mapContainer").outerHeight()), $("#swipeZone").offset({
        top: $("#mapContainer").offset().top
    }), $("#lyrX_layer").attr("clip-path", "url(#gfx_clip1)"), $("#lyrY_layer").attr("clip-path", "url(#gfx_clip2)"), t.stop()
}

function layerMaker(t) {
    var e = {},
        r = new esri.tasks.FeatureSet(t),
        a = {
            layerDefinition: {
                geometryType: "esriGeometryPoint",
                fields: r.fields
            },
            featureSet: r
        };
    e.fx = new esri.layers.FeatureLayer(a, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        id: "lyrX",
        dataAttributes: ["FID"]
    });
    var n = new esri.tasks.FeatureSet(t),
        i = {
            layerDefinition: {
                geometryType: "esriGeometryPoint",
                fields: n.fields
            },
            featureSet: n
        };
    return e.fy = new esri.layers.FeatureLayer(i, {
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        id: "lyrY",
        dataAttributes: ["FID"]
    }), e
}

function initLayers(t) {
    var e = new Timer(arguments);
    e.start(), f = layerMaker(t), f1 = f.fx, f2 = f.fy;
    var r = new esri.symbol.SimpleMarkerSymbol;
    r.outline.setWidth(0), r.setSize(0), lx = layerDefs[sL[0]], ly = layerDefs[sL[1]];
    var a = new esri.renderer.SimpleRenderer(r);
    a.setColorInfo({
        field: lx.colField,
        stops: setColStops(lx)
    }), f1.setRenderer(a);
    var n = new esri.renderer.SimpleRenderer(r);
    n.setColorInfo({
        field: ly.colField,
        stops: setColStops(ly)
    }), f2.setRenderer(n), map.addLayers([f1, f2]);
    var i = t.features.map(function(t) {
        var e = t.attributes;
        return e.mx = t.geometry.x, e.my = t.geometry.y, sumVals.f += t.attributes.For2008, sumVals.vx += t.attributes[lx.sumField], sumVals.vy += t.attributes[ly.sumField], sumVals.p += t.attributes.Tot_plots, e
    });
    initChart(i), initCounters(), e.stop()
}

function customLegend(t, e) {
    var r = new Timer(arguments);
    r.start();
    var a = 55,
        n = t.text(),
        i = layerDefs.filter(function(t) {
            return t.title == n
        })[0];
    if (2 == i.stops.length) var s = genRange(0, 1, .25).map(function(t) {
        return {
            value: parseInt(i.valScale(t)),
            size: parseInt(i.sizeScale(i.valScale(t))),
            color: i.colScale(i.valScale(t))
        }
    });
    else var s = i.stops.map(function(t, e) {
        return {
            value: t,
            size: i.symbolSizes[e],
            color: i.colScale(t)
        }
    });
    var o = "#" + t.parent().parent().attr("id");
    "reverse" == e && (s = s.reverse()), d3.select(o).selectAll("svg").remove();
    var l = d3.select(o).append("svg").attr("class", "svgL");
    l.append("text").attr("x", a).attr("y", 20).attr("font-size", "20px").attr("font-weight", "bold").style("text-anchor", "midde").text(i.legendDef), l.selectAll(".lgndPt").data(s).enter().append("circle").attr("class", "lgndPt").attr("r", function(t) {
        return .5 * t.size
    }).attr("cx", a + 10).attr("cy", function(t, e) {
        return 8 + 41 * (e + 1)
    }).attr("fill", function(t) {
        return t.color
    }).style("opacity", colAlpha), l.selectAll(".lgndTxt").data(s).enter().append("text").attr("class", "lgndTxt").attr("x", a + 40).attr("y", function(t, e) {
        return 8 + 41 * (e + 1)
    }).attr("dy", "0.35em").text(function(t) {
        return t.value
    }), r.stop()
}

function scaleLegend() {
    var t = new Timer(arguments);
    t.start(), d3.selectAll(".lgndPt").transition().duration(300).attr("r", function(t) {
        return scaleSymbSize(t.size)
    }), t.stop()
}

function filterChartBasedOnMap() {
    var t = new Timer(arguments);
    t.start();
    var e = map.extent;
    d3.selectAll(".dot").transition().duration(300).attr("r", function(t) {
        return inRange(t.mx, [e.xmin, e.xmax]) && inRange(t.my, [e.ymin, e.ymax]) ? r(t.PctFor2008) : 0
    }), t.stop()
}

function renderMapBasedOnChart() {
    var t = new Timer(arguments);
    t.start();
    var e = ["X", "Y"],
        r = getLyrs(),
        a = map.extent;
    e.map(function(t, e) {
        map.getLayer("lyr" + t).graphics.map(function(e) {
            var n = r.X.valField,
                i = r.Y.valField;
            if (inRange(e.geometry.x, [a.xmin, a.xmax]) && inRange(e.geometry.y, [a.ymin, a.ymax]))
                if (inRange(e.attributes[n], x.domain()) && inRange(e.attributes[i], y.domain())) {
                    var s = parseInt(scaleSymbSize(r[t].sizeScale(e.attributes[r[t].valField])));
                    e.getNode().setAttribute("r", s)
                } else e.getNode().setAttribute("r", 0)
        })
    })
		t.stop();
		t.start();
		//initMapHighlight()
		t.stop();
}

/*
function initMapSymbols(t) {
	var r = getLyrs();
	t.map(function(t, e) {
			var a = t.id.slice(-1);
			t.on("graphic-node-add", function(t) {
					t.node.setAttribute("r", parseInt(scaleSymbSize(r[a].sizeScale(t.graphic.attributes[r[a].valField]))));
			})
	})
}
*/

function getData() {
    var t = new Timer(arguments);
    t.start(), $.getJSON("json/conus_emap_hexes.json", function(t) {
        t.features = t.features.filter(function(t) {
            return t.attributes.ForPlots13 >= minPlots || t.attributes.ForPlots08 >= minPlots
        }), initLayers(t)
    }), t.stop()
}

function addHomeSlider() {
    dojo.create("div", {
        className: "esriSimpleSliderHomeButton",
        title: "Zoom to Full Extent",
        onclick: function() {
            map.centerAndZoom([-86.45, 38.75], 5)
        }
    }, dojo.query(".esriSimpleSliderIncrementButton")[0], "after")
}

function inRange(t, e) {
    return t > d3.min(e) && t < d3.max(e)
}

function transform(t, e) {
    return "translate(" + x(t) + "," + y(e) + ")"
}

function initChart(t) {
    function e() {
        d3.select(".x.axis").call(xAxis), d3.select(".y.axis").call(yAxis);
        var t = getLyrs();
        d3.selectAll(".dot").attr("transform", function(e) {
            return transform(e[t.X.valField], e[t.Y.valField])
        }), unhighlightPoints()
    }
    margin = {
        top: 10,
        right: 10,
        bottom: 40,
        left: 56
    }, outerWidth = $("#chartContainer").width(), outerHeight = $("#chartContainer").height(), width = outerWidth - margin.left - margin.right, height = outerHeight - margin.top - margin.bottom, x = d3.scale.linear().range([0, width]).nice(), y = d3.scale.linear().range([height, 0]).nice(), r = d3.scale.linear().range([2, 10]).nice();
    var a = getLyrs();
    xf = a.X.valField, yf = a.Y.valField;
    var n = a.X.title,
        i = a.Y.title,
        s = "PctFor2008",
        o = 1.05 * d3.max(t, function(t) {
            return t[xf]
        }),
        l = d3.min(t, function(t) {
            return t[xf]
        }),
        l = l - .05 * (o - l),
        u = 1.05 * d3.max(t, function(t) {
            return t[yf]
        }),
        d = d3.min(t, function(t) {
            return t[yf]
        }),
        d = d - .05 * (u - d),
        c = d3.max(t, function(t) {
            return t[s]
        }),
        p = d3.min(t, function(t) {
            return t[s]
        }),
        p = p > 0 ? 0 : p;
    x.domain([l, o]), y.domain([d, u]), r.domain([p, c]), xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(-height), yAxis = d3.svg.axis().scale(y).orient("left").tickSize(-width);
    d3.scale.category10();
    zoomBeh = d3.behavior.zoom().x(x).y(y).scaleExtent([0, 500]).on("zoom", function(t) {
        e(), renderMapBasedOnChart(), updateAllCounters(sumVar())
    });
    var m = d3.select("#chartContainer").append("svg").attr("width", outerWidth).attr("height", outerHeight).attr("id", "chartInfo").append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")").call(zoomBeh);
    m.append("rect").attr("id", "scatterRect").attr("width", width).attr("height", height), m.append("g").classed("x axis", !0).attr("transform", "translate(0," + height + ")").call(xAxis).append("text").classed("label", !0).attr("id", "xAxisLabel").attr("x", width).attr("y", margin.bottom - 10).style("text-anchor", "end").text(n), m.append("g").classed("y axis", !0).call(yAxis).append("text").classed("label", !0).attr("id", "yAxisLabel").attr("transform", "rotate(-90)").attr("y", -margin.left).attr("dy", "1.0em").style("text-anchor", "end").text(i);
    var f = m.append("svg").classed("objects", !0).attr("width", width).attr("height", height);
    f.append("svg:line").classed("axisLine hAxisLine", !0).attr("x1", 0).attr("y1", 0).attr("x2", width).attr("y2", 0).attr("transform", "translate(0," + height + ")"), f.append("svg:line").classed("axisLine vAxisLine", !0).attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", height), f.selectAll(".dot").data(t).enter().append("circle").classed("dot", !0).attr("r", function(t) {
        return r(t.PctFor2008)
    }).attr("transform", function(t) {
        return transform(t[xf], t[yf])
    }).style("fill", "#006d2c").on("mouseover", function(t) {
        unhighlightPoints(), highlightPoints(t[featureId])
    })
}

function DropDown(t) {
    this.dd = t, this.placeholder = this.dd.children("span"), this.opts = this.dd.find("ul.dropdown > li"), this.val = "", this.index = -1, this.initEvents()
}

function populateDropdown(t) {
    var e = $("#dd" + t);
    e.val(t);
    var r = e.find("span"),
        a = e.find(".dropdown");
    r.text(layerDefs[sL[t]].title), layerDefs.map(function(t) {
        a.append($(document.createElement("li")).append($(document.createElement("a")).attr("href", "#").text(t.title)))
    })
}
var map, initExtent, minPlots = 10,
    featureId = "FID",
    zoomRange = {
        min: 5,
        max: 10
    },
    aScale = d3.scale.linear(),
    sumVals = {
        f: 0,
        vx: 0,
        vy: 0,
        p: 0
    },
    numF = d3.format("0,000"),
    perF = d3.format("0.3%"),
    sL = [5, 2];
! function() {layerDefs.map(function(t) {appendLyrScales(t)})}()

d3.selection.prototype.first = function() {
    return d3.select(this[0][0])
}
d3.selection.prototype.last = function() {
    var t = this.size() - 1;
    return d3.select(this[0][t])
}
require(["esri/map", "esri/basemaps", "dojo/domReady!"], function(t, e) {
	e.lightGray = {
			baseMapLayers: [{
					url: "http://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Light_Gray_Base/MapServer"
			}],
			title: "lightGray"
	}
	e["dark-gray"] = {
			baseMapLayers: [{
					url: "http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer"
			}],
			title: "dark-gray"
	}
	map = new t("map", {
			basemap: "lightGray",
			center: [-82.45, 47.75],
			zoom: 5,
			minZoom: zoomRange.min,
			maxZoom: zoomRange.max
	})
	map.on("load", function() {
			getData(), addHomeSlider(), $(window).trigger("resize")
	})
	map.on("layers-add-result", function(t) {
			var e = $("#map").width();
			parseInt(.8 * e);
			customLegend($("#lX"), layerDefs[sL[0]].legendOrder), customLegend($("#lY"), layerDefs[sL[1]].legendOrder), initSwipe(), map.on("extent-change", function() {
					swipeTransform(), scaleLegend(), renderMapBasedOnChart(), filterChartBasedOnMap(), updateAllCounters(sumVar())
			})
			//initMapSymbols(t.layers.map(function(t) {return t.layer}));
	})
	map.on("pan", function() {
			console.log("pan"), swipeTransform()
	})
})

$(window).resize(function() {
	var t = $(window).height() - 20;
	$("#mapContainer").outerWidth($(window).width() - 426), $("#mapContainer").outerHeight(t), $("#swipeZone").outerHeight(t), $("#swipeZone").offset({
			top: $("#mapContainer").offset().top
	})
});
var xAxis, yAxis, x, y, r, margin, zoomBeh;
lyrDims = ["X", "Y"], DropDown.prototype = {
    initEvents: function() {
        var t = this;
        t.dd.on("click", function(t) {
            return $(this).toggleClass("active"), !1
        }), t.opts.on("click", function() {
            var e = $(this);
            t.val = e.text(), t.index = e.index(), t.placeholder.text(t.val), selectLayers(lyrDims[parseInt(this.parentNode.parentNode.value)])
        })
    },
    getValue: function() {
        return this.val
    },
    getIndex: function() {
        return this.index
    }
}, $(function() {
    new DropDown($("#dd0"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
}), $(function() {
    new DropDown($("#dd1"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
}), populateDropdown(0), populateDropdown(1);