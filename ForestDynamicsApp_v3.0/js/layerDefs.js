var sr = {min:3,max:9};
var colAlpha = 0.8;
var layerDefs = [
	{
		title:"2008 Forested Area",
		valField:"PctFor2008",
		colField:"PctFor2008",
		sumField:"For2008",
		colors:[
			[197,208,193,colAlpha],
			[0,109,44,colAlpha]
		],
		legendDef:"Percent",
		stops:[0,100],
		symbolSizes:[sr.min,sr.max],
		scalingFactor: 1,
		legendOrder:"normal",
		minMax:[-5,105]
	},
	{
		title:"2013 Forested Area",
		valField:"PctFor2013",
		colField:"PctFor2013",
		sumField:"For2013",
		colors:[
			[197,208,193,colAlpha],
			[0,109,44,colAlpha]
		],
		legendDef:"Percent",
		stops:[0,100],
		symbolSizes:[sr.min,sr.max],
		scalingFactor: 1,
		legendOrder:"normal",
		minMax:[-5,105]
	},
	{
		title:"Net Annual Percent Forest Change",
		valField:"PctNAFC",
		colField:"PctNAFC",
		sumField:"NAFC",
		colors:[
			[255,0,0,colAlpha],
			[255,75,75,colAlpha],
			[220,220,220,colAlpha],
			[75,75,255,colAlpha],
			[0,0,255,colAlpha]			
		],
		legendDef:"Percent",
		stops:[-100,-1,0,1,150],
		symbolSizes:[sr.max,sr.min+1,sr.min-1,sr.min+1,sr.max],
		scalingFactor: 1,
		legendOrder:"reverse",
		minMax:[-80,150]
	},
	{
		title:"Annual Percent Forest Cutting",
		valField:"PctAC",
		colField:"PctAC",
		sumField:"AC",
		colors:[
			[0,255,0,colAlpha],
			[255,0,0,colAlpha]			
		],
		legendDef:"Percent",
		stops:[0,20],
		symbolSizes:[sr.min,sr.max],
		scalingFactor: 1,
		legendOrder:"normal",
		minMax:[-1,20]
	},
	{
		title:"Annual Percent Forest Canopy Disturbance",
		valField:"PctACD",
		colField:"PctACD",
		sumField:"ACD",
		colors:[
			[0,255,0,colAlpha],
			[255,0,0,colAlpha]			
		],
		legendDef:"Percent",
		stops:[0,20],
		symbolSizes:[sr.min,sr.max],
		scalingFactor: 1,
		legendOrder:"normal",
		minMax:[-1,20]
	},
	{
		title:"Annual Forest Cutting or Disturbance",
		valField:"PctACaCD",
		colField:"PctACaCD",
		sumField:"ACaCD",
		colors:[
			[0,255,0,colAlpha],
			[255,0,0,colAlpha]			
		],
		legendDef:"Percent",
		stops:[0,20],
		symbolSizes:[sr.min,sr.max],
		scalingFactor: 1,
		legendOrder:"normal",
		minMax:[-1,20]
	}
];