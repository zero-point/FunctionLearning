// save chosen linear,etc functions in JSON to be recovered and lists of no's generated
// depending on the condition, a different JSON element is chosen and fed into a function (together with the pres style)
// that function then creates the bar/scatter plot with the given data

// TODO: start by having a function for each condition and externalising the input data
//TODO: alert/ infobox if user doesn't do anything

function loadJSON(path,callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }

function randomCondition(){
  var presentationTypes = ["bar","scatter-nomem","scatter-fullmem"];
  var functionTypes = ["linear","quadratic","periodic"];
  //return [presentationTypes[Math.floor(Math.random()*presentationTypes.length)],functionTypes[Math.floor(Math.random()*functionTypes.length)]];
  return [presentationTypes[0],functionTypes[0]];
}

function displayInstructions(condition){
  loadJSON('exp_input.json', function(data){
    var parsed_data = JSON.parse(data);
    //console.log(parsed_data["instructions"][condition]);
    document.querySelector(".instructionText").innerHTML = parsed_data["instructions"][condition];
  });
}

var functionDict = {
  "linear": function(x) {return 2*x+1;},
  "quadratic": function(x) {return x*x;},
  "periodic": function(x) {return Math.sin(x*(Math.PI/180))+1;},
};

var presentationDict = {
  "bar": function(x) {barPlot(x);},
  "scatter-nomem": function scatterNoMemPlot(){},
  "scatter-fullmem": function scatterFullMemPlot(){}
};

/* GENERATING RANDOM CONDITION*/
var expCondition = randomCondition();
//console.log(expCondition);

/* CONSTRUCTING FUNCTION'S X AND Y ARRAYS*/
var positions = Array.apply(null, {length: 80}).map(Number.call, Number);
var xValue = positions.map(function(x) { return x+1; });
var yValue = xValue.map(function(x) { return functionDict[expCondition[1]](x); });
var xyValues = [xValue,yValue];
//console.log(xValue,yValue);

/* DISPLAYING INSTRUCTIONS */
displayInstructions("train-"+expCondition[0]);
//displayInstructions("test-"+expCondition[0]);

presentationDict[expCondition[0]](xyValues);

function barPlot(xyValues){
  var horiz = document.createElement('div');
  var vert = document.createElement('div');
  var space = document.createElement('div');
  space.className = "col-md-1";

  document.querySelector(".container").appendChild(horiz);
  document.querySelector(".container").appendChild(space);
  document.querySelector(".container").appendChild(vert);

  console.log(xyValues);
  judgementCount = 1;

  var widthX = 504,
    heightX = 100,
    widthY = 100,
    heightY = 504;                    // TODO: should the size of the plots be relative to the users' screen?
  var paddedHeightY = heightY-2,
      paddedWidthX = widthX-2,
      paddedHeightX = heightX-4,
      paddedWidthY = widthY-4;

  var scaleX = d3.scaleLinear()
    .domain([Math.min.apply(null, xyValues[0]), Math.max.apply(null, xyValues[0])])
    .rangeRound([2, widthX-2]);
  var scaleY = d3.scaleLinear()
    .domain([Math.min.apply(null, xyValues[0]), Math.max.apply(null, xyValues[1])])
    .rangeRound([2, heightY-2]);

  var svgX = d3.select(horiz)
  .append("svg")
    .attr("width", widthX)
    .attr("height", heightX)
    .attr("style", "outline: 2px solid black;")

  var svgY = d3.select(vert)
    .append("svg")
      .attr("width", widthY)
      .attr("height", heightY)
      .attr("style", "outline: 2px solid black;")
      .on("click", clicked)

  var blueXRect = svgX.append("rect")
      .attr('x', 2)
      .attr('y', 2)
      .style('stroke', 'steelblue')
      .style('fill', 'steelblue')
      .attr("width", scaleX(xyValues[0][judgementCount]))   // scaling the x axis values to the width of the rectangle
      .attr("height", paddedHeightX);   // the blue rectangle on the left (representing X axis value) has a height of set size with padding

  var closeGuess = false;
  var selection_made = false;
  function blueYRect(yValue){
    svgY.append("rect")
      .attr('id',"temp_blue")
      .attr('x', 2)
      .attr('y', scaleY(yValue))
      .style('stroke', 'steelblue')
      .style('fill', 'steelblue')
      .attr("width", paddedWidthY)
      .attr("height", paddedHeightY-scaleY(yValue));
  }
  function redYRect(){
    svgY.append("rect")
    .attr('id',"temp_red")
      .attr('x', 2)
      .attr('y', scaleY(xyValues[1][judgementCount]))
      .style('stroke', 'red')
      .style('fill', 'red')
      .attr("width", paddedWidthY)
      .attr("height", paddedHeightY-scaleY(xyValues[1][judgementCount]));
  }
  function clicked(d){
    if (d3.event.defaultPrevented) return; // dragged
    var coordinates = d3.mouse(this);
    //console.log(coordinates);
    if(coordinates[1]>=2 && coordinates[1]<=heightY-4){
      console.log(coordinates[1]);
      var target = coordinates[1];
    //  console.log(heightY-target);
      svgY.select("#temp_red").remove();
      svgY.select("#temp_blue").remove();
      blueYRect(scaleY.invert(target));
      //console.log(Math.abs(scaleY(xyValues[1][judgementCount])-target));
      if (Math.abs(scaleY(xyValues[1][judgementCount])-target)<50) {
      //  console.log(xyValues[1][judgementCount],scaleY(xyValues[1][judgementCount]));
        closeGuess = true;
      //  console.log("Close");
      }
      selection_made = true;

      document.onkeyup = function(e) {
        var key = e.keyCode || e.which;
        if (key === 32 && selection_made ) {
          console.log("user hit space");
          //submittedPoints.push(target);
          if (scaleY(xyValues[1][judgementCount])<target) {
            svgY.select("#temp_blue").remove();
            redYRect();
            blueYRect(scaleY.invert(target));
          }
          else {
            svgY.select("#temp_blue").remove();
            blueYRect(scaleY.invert(target));
            redYRect();
          }
        }
      }


    }
  };

}
