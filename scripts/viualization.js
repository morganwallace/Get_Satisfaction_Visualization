/*		This script will use d3.js and Jquery to produce charts from combination static and api requested datasets from
Get Satisfaction. 

*/
var timeNow = new Date();
var format = d3.time.format("%Y/%m/%d"),
long_format = d3.time.format("%Y/%m/%d %H:%M:%S")



function viz(dataset,datasetType,platform){
	var blockTracker =new Object();
	var maxBlocks = 1;
	var blockHeight = 0;


	var totalProblems = 0;
	var totalQuestions = 0;
	var totalIdeas = 0;
	var totalPraise = 0

	console.log(dataset);


	//SVG variables
	var w = $("#container").width(),
	h = $("#container").height()
	$("#webContainer").css("height","h");
	var padding = 50,
	sidePadding = 35,
	p=[10,30,90,35],
	shortFormat = d3.time.format("%m/%d/%Y"),
	condensedFormat = d3.time.format("%y%m%d")


	//Filter out dates
	if (platform == "web"){
		dataset=dataset.filter(function(d) { 
			return (d.created_at.slice(0,10).split("/").join("") > 20130520) 
		})
	}
	else if( platform=="mobile"){
		dataset=dataset.filter(function(d) { 
			return (d.created_at.slice(0,10).split("/").join("") > 20130520) 
		})		
	}
	
	//Set endpoints for the dates
	var minDate = new Date(d3.min(dataset, function(d) { 
	 	return format.parse(d.last_active_at.slice(0,10)); }))
	var maxDate= new Date(d3.max(dataset, function(d) { 
	 	return format.parse(d.last_active_at.slice(0,10)); }))
	var fullMaxDate= new Date(d3.max(dataset, function(d) { 
	 	return long_format.parse(d.last_active_at.slice(0,19)); }))

	 console.log("min date is: " + shortFormat(minDate) +". And max date is: "+shortFormat(maxDate));

	//X Scale
	var xScale = d3.time.scale()
		.domain([minDate,maxDate])
		.rangeRound([p[3],w-p[1]])
		
	;
  	var heightScale = d3.scale.linear()
	 .domain([0, 1])
	 .range([0, (h-(p[0]+p[2]))/maxBlocks]);


	//Create SVG element
	var svg = d3.select("#"+platform+"Container")
				.append("svg")
				.attr("width", w)
				.attr("height", h)
				.append("svg:g")
			    ;

	//Create hidden SVG element for testing
	var hidden_svg = d3.select("#"+platform+"Container")
				.append("svg")
				.attr({"width":0,"height":0})
				.append("svg:g")
			    ;



	//draw bars for counting purposes only - HIDDEN
			var rect= hidden_svg.selectAll("rect")
		   .data(dataset)
		   .enter()
		   .append("rect")
		   //Stacking function: 
		   .attr("y", function(d){
		   		var thisDate = d.created_at.slice(0,10)
		   		if (thisDate in blockTracker){
			   		blockTracker[thisDate]++;
			   		if (blockTracker[thisDate]>maxBlocks){maxBlocks=blockTracker[thisDate]}
		   		}
		   		else{
		   			blockTracker[thisDate]=1;
		   		}
		   		return(h-(p[0]+p[2]))-(blockTracker[thisDate]*blockHeight)})
		   .attr({"height": function(d){return heightScale(1)},
		   	      'width':"0"
			})
	
		   
		   blockHeight = (h-(p[0]+p[2]))/maxBlocks;
		   var curYpos= new Object();
		   var deltaDays = ((maxDate)-(minDate))/(3600000*24);
		   var blockWidth = (w-(p[3]+p[1]))/deltaDays

	//Draw Bars
	var draw_bars = function(s){
		filtered_dataset=dataset.filter(function(d) { 						

			return (d.style == s) 
		})
			svg.selectAll("rect")
		   .data(filtered_dataset, function(d){return d.id;})
		   .enter()
		   .append("rect")
		   .attr("x", function(d) {
		   		return xScale(format.parse(d.created_at.slice(0,10))) 
		   })
		   //Stacking function: 
		   .attr("y", function(d){
		   		var thisDate = d.created_at.slice(0,10);
		   		if (thisDate in curYpos){
		   			curYpos[thisDate]=curYpos[thisDate] + blockHeight}				   		
		   		else {curYpos[thisDate]=blockHeight}
		   		var yPos = (h-(p[2]))-(curYpos[thisDate])

		   		return yPos})

		   .attr({"height": function(d){return blockHeight},
		   	      'width':blockWidth,
		   		  "class":function(d){return d.style+" block"},
		   		  "id":function(d){return d.id+platform},
		   		  'alt':function(d){return d.subject},
		   		  "stroke": "white",
				  "stroke-width": 1
			})
	}
   	draw_bars("problem");
	   	draw_bars("question"); 
	   	draw_bars("idea");
	   	draw_bars("praise");

	//Popups
   	$('svg rect').tipsy({ 
        gravity: function(d){
        	if ($(this).position().left < (w/2)){
        		return "w"
        	}
        	else{
	        	return "e"
	        }
        }, 
        html: true, 
        title: function() {
          var d = this.__data__;
          var subject = d.subject;
          if (this.__data__.status == null){
          	var status = "None"
          }
          else{var status = this.__data__.status}
          var popup= '<h4 class="popup-title">Details</h4>'+
           '<p><strong>Subject:</strong> ' + subject +'</p>'+
           '<div class="popup-content"><p><strong>Content:</strong> '+this.__data__.content+'</p></div>'+
           '<div class="popup-footer"><p>Current Status: <strong>'+status+'</strong></p></div>'+
           '<div class="popup-footer"><p><strong>'+this.__data__.me_too_count+'</strong> People have this problem</p></div>'+
           '<div><a class="viewPost" href="'+this.__data__.at_sfn +'">View Post</a></div>'
          return popup; 
        }
      });


	var yScale = d3.scale.linear()
	 // .domain([0, d3.max(dataset, function(d) { return d[1]; })])
	 .domain([0, maxBlocks])
	 .range([h - p[2], p[0]]);


	//Define X axis
	var xAxis = d3.svg.axis()
					  .scale(xScale)
					  .orient("bottom")
					  .ticks(d3.time.days, 2)//tick every 2 days
					  .tickFormat(d3.time.format("%b %d"))
					  ;

	//Define Y axis
	var yAxis = d3.svg.axis()
					  .scale(yScale)
					  .orient("left")
					  .ticks(5)
					  // .attr('transform',"translate(5)")
					  ;

	//Create X axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - p[2]) + ")")
		.call(xAxis)
		.selectAll("text")  
            .style("text-anchor", "end")
            .attr({"dx": "-.8em",
            	   "dy": ".15em",
            	   "class": "axis-label axis-text x-axis-label",
				   "transform": function(d) {
                return "rotate(-65)" 
            }});
	
	//Create Y axis
	svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(" + ((1*p[3])) + ",0)")
		.call(yAxis);
	
	//Y Axis Label
	svg.append('text')
		.text("Number of posts")
		.attr({
			"class":"axis-label",
			"transform":"translate("+ (p[3]-30)+","+((2*h)/5)+") rotate(90)",
			// "font-size":16
		})

	//Chart Title
	var chartTitle = svg.append("text")
		.text(function(){
			if (datasetType == "Static"){
				return "Static data from 5/21/2013 through "+shortFormat(maxDate);
			}
			else{
				return "Live data: most recent post at "+ long_format(fullMaxDate)
			}
		})
		.attr("transform","translate("+(w/3)+",30)")	



	svg.append("text")
		.text("Problem")
		.attr("transform","translate(50,"+(h-(p[2]/10))+")")
		.attr("class","legend-text");
	svg.append("text")
		.text("Question")
		.attr("transform","translate(150,"+(h-(p[2]/10))+")")
		.attr("class","legend-text");
	svg.append("text")
		.text("Idea")
		.attr("transform","translate(250,"+(h-(p[2]/10))+")")
		.attr("class","legend-text");
	svg.append("text")
		.text("Praise")
		.attr("transform","translate(330,"+(h-(p[2]/10))+")")
		.attr("class","legend-text");
	
	svg.append("rect")
		.attr({
			"x":35,
			"y":h-(p[2]/3),
			"height": blockHeight,
			"width":".6em",
			"class": "problem block" 
		})
	svg.append("rect")
		.attr({
			"x":135,
			"y":h-(p[2]/3),
			"height": blockHeight,
			"width":".6em",
			"class": "question block" 
		})
	svg.append("rect")
		.attr({
			"x":235,
			"y":h-(p[2]/3),
			"height": blockHeight,
			"width":".6em",
			"class": "idea block" 
		})
	svg.append("rect")
		.attr({
			"x":315,
			"y":h-(p[2]/3),
			"height": blockHeight,
			"width":".6em",
			"class": "praise block" 
		})					
		
		//Create most common problems list
	var problemsList = d3.select("#"+platform+"Container")
		.append("ol")
		.attr("width", w)
		.attr("height", h)
		.attr("id","problemsList")
	    ;	

	problemsList.append('h2')
		.text("5 Most Popular Questions, Problems, Ideas, or Praise")		    

	meTooSorted = dataset.sort(function(a,b){
	    if (a.me_too_count > b.me_too_count)
	      return 1;
	    if (a.me_too_count < b.me_too_count)
	      return -1;
	    // a must be equal to b
	    return 0;
	})	
	meTooSorted=meTooSorted.reverse()

	for (var i = 1; i <= 5; i++) {
		problemsList.append('li')
			.attr("id",function(){
				newid=meTooSorted[i].id+platform;
				console.log(newid)
				return newid})
			.html(meTooSorted[i].subject+" - <strong>"+meTooSorted[i].me_too_count+"</strong> people feel this way.")
		
	}

 	$("#problemsList li").click(function(d){
 		$('.block').fadeTo(200, 0.1);
 		$("#"+$(this).attr("id")).fadeTo(0,1)
 	})


	bindBlockEvents()
}//End visualization formula
			
$(document).ready(function(){

	//Fade others on click 
	bindBlockEvents = function(){
		$(".block").hover(function(){

			$(this).attr({'stroke':"lightblue",
						  'stroke-width':3});
		},function(){
			$(this).attr({'stroke':"white",
						  'stroke-width':1})}
		);

		$('.block').click( function () {
				target = $(this).attr('class');
				$('.block').each(function(i, val){ 
					if ( val.className.animVal !== target )
					{ 
						$(val).fadeTo(200, 0.1);
					}
					else 
					{
						$(val).fadeTo(200, 1);
					}
				})
		})

		//UnFade all on 
		 $('svg').click(function(){
		 	if (event.target == this){
		 		console.log("something");
			 	$('rect').each(function(i, val){ 
					$(val).fadeTo(200, 1);
			 })}
		});
	}



	var weekAgo = timeNow.getSeconds() - (1*24*3600)
	var sinceLaunch=1369094400 //May 21, 2013 12:00AM
	var lastDatasetDate = d3.max(dataset, function(d) { 
		 	return long_format.parse(d.last_active_at.slice(0,19)); })
	lastDatasetDate = (lastDatasetDate.getTime()/1000)+1
	var lastMobileDatasetDate = d3.max(mobiledataset, function(d) { 
		 	return long_format.parse(d.last_active_at.slice(0,19)); })
	lastMobileDatasetDate = (lastMobileDatasetDate.getTime()/1000)+1
	console.log(lastMobileDatasetDate)
	// console.log(weekAgo);
	

	//Live updating data.
	var response=" ";

	var liveUpdate = function(platform){
		// $("#container").html()
		var pageNo = 1;
		if (platform=="web"){var liveDataset = dataset;}
		if (platform=="mobile"){var liveDataset=mobiledataset;}
		var makeQuery = function(platform){
			var product=''
			if (platform=="web"){
				product='61828';
				var lastDate = lastDatasetDate;
			}
			else if (platform=="mobile"){
				product="autocadws_autocad_ws_iphone_app";
				var lastDate = lastMobileDatasetDate;
			}
			// console.log(product,"-",lastDate)
			var query = "https://api.getsatisfaction.com/products/"+product+"/topics.json?active_since="+lastDate+"&limit=30&page="+pageNo+"&callback=?";
			console.log(query)
			$.getJSON(query,function ( data ) {
					response=data["data"][0];
					if (response != undefined){
						// console.log(response)
						liveDataset= liveDataset.concat(data['data']);
						pageNo++;
						makeQuery(platform);
					}
					else{
						$("#loadbar").fadeOut(300,function(){
							viz(liveDataset,'live',platform)
						})
					}
			});
		}
		makeQuery(platform);	
	}
	liveUpdate("web");
	liveUpdate("mobile")
 	


})//end $(document).ready function
		
		