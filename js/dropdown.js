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
            n.val = t.text(), n.index = t.index(), n.placeholder.text(n.val)
			selectLayers();
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
    new DropDown($("#dd1"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
})
$(function() {
    new DropDown($("#dd2"));
    $(document).click(function() {
        $(".wrapper-dropdown-3").removeClass("active")
    })
});

function populateDropdown(ddid,item1){
				var dd = document.getElementById(ddid);
				var s = dd.getElementsByTagName("span");
				var ul = dd.getElementsByClassName("dropdown");
				if(item1 !== undefined){
					s[0].textContent = item1;
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.setAttribute("href","#");
					a.textContent = "None";
					li.appendChild(a);
					ul[0].appendChild(li);
				}else{
					s[0].textContent = layerDefs[0].title;
				}
				for(i = 0; i < layerDefs.length; i++){
					var li = document.createElement("li");
					var a = document.createElement("a");
					a.setAttribute("href","#");
					a.textContent = layerDefs[i].title;
					li.appendChild(a);
					ul[0].appendChild(li);
				}
			}
			
			populateDropdown("dd1");populateDropdown("dd2","None");