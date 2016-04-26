lyrDims = ['X','Y'];
function DropDown(n) {
    this.dd = n, this.placeholder = this.dd.children("span"), this.opts = this.dd.find("ul.dropdown > li"), this.val = "", this.index = -1, this.initEvents()
}
DropDown.prototype = {
    initEvents: function() {
        var n = this;
        n.dd.on("click", function(n) {
            return $(this).toggleClass("active"), !1
        }), n.opts.on("click", function() {
            var t = $(this);
            n.val = t.text(), n.index = t.index(), n.placeholder.text(n.val);
						selectLayers(lyrDims[parseInt(this.parentNode.parentNode.value)]);
				})
    },
    getValue: function() {
        return this.val
    },
    getIndex: function() {
        return this.index
    }
}
$(function() {
    var dd1 = new DropDown($("#dd0"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
})

$(function() {
    var dd2 = new DropDown($("#dd1"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
});

function populateDropdown(id){
	var dd = $("#dd" + id);
	dd.val(id);
	var s = dd.find("span");
	var ul = dd.find(".dropdown");
	s.text(layerDefs[sL[id]].title);
	layerDefs.map(function(d){
		ul.append(
			$(document.createElement("li"))
			.append(
				$(document.createElement("a"))
				.attr("href","#")
				.text(d.title)
			)
		)
	});
}
			
populateDropdown(0);populateDropdown(1);