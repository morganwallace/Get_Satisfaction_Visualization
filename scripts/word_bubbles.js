//Word Bubbles
//Creates svg circles for commonly used words in Get Satisfaction posts
var bubbleViz = function(dataset,platform){
	console.log(dataset);
}

var diameter = 960,
    color = d3.scale.category20c();

var bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(1.5);

var bubbleSVG = d3.select("#bubbleContainer").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .attr("class", "bubble");


var node = bubbleSVG.selectAll("g")
  .data(dataset)
  // .filter(function(d) { return !d.children; }))
.enter().append("g")
  .attr("class", "node")
  .attr("transform", function(d) { return "translate(" + d.me_too_count + "," + d.reply_count + ")"; });

node.append("title")
  .text(function(d) { return d.subject;});

node.append("circle")
  .attr("r", function(d) { return d.follower_count; })
  .style("fill", function(d) { return color(d.style); })
  ;

node.append("text")
  .attr("dy", ".3em")
  .style("text-anchor", "middle")
  .text(function(d) { return d.subject.substring(0, d.follower_count / 3); });


// Returns a flattened hierarchy containing all leaf nodes under the root.
// function classes(root) {
//   var classes = [];

//   function recurse(name, node) {
//     if (node.children) node.children.forEach(function(child) { recurse(node.name, child); });
//     else classes.push({packageName: name, className: node.name, value: node.size});
//   }

//   recurse(null, root);

d3.select(self.frameElement).style("height", diameter + "px");