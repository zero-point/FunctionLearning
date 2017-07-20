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


function barPlot(xyValues, currentMode, expCondition){

  var horiz = document.createElement('div');
  var vert = document.createElement('div');
  var space = document.createElement('div');
  space.className = "col-md-1";

  document.querySelector(".container").appendChild(horiz);
  document.querySelector(".container").appendChild(space);
  document.querySelector(".container").appendChild(vert);

  if(debugmode){
    judgementCount = 34;
    document.getElementById('judgementCount').innerHTML = "Judgment "+(judgementCount+1)+" out of 40";
  }
  else {
    judgementCount = 0;
  }


  var submittedPoints = [];

  /* size of black containers */
  var widthX = 504,
    heightX = 100,
    widthY = 100,
    heightY = 504,                      // TODO: should the size of the plots be relative to the users' screen?
    paddedHeightY = heightY-2,
    paddedWidthX = widthX-2,
    paddedHeightX = heightX-4,
    paddedWidthY = widthY-4;

  /* scale of blue rectangles*/
  var blueWidthX = 500,
      blueHeightY = 500;
  var scaleX = d3.scaleLinear()
    .domain([Math.min.apply(null, xyValues[0]), Math.max.apply(null, xyValues[0])])
    .range([0, blueWidthX]);
  var scaleY = d3.scaleLinear()
    .domain([Math.min.apply(null, xyValues[1]), Math.max.apply(null, xyValues[1])])
    .range([0, blueHeightY]);

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
      .attr('id',"left_blue")
      .attr('x', 2)
      .attr('y', 2)
      .style('stroke', 'steelblue')
      .style('fill', 'steelblue')
      .attr("width", scaleX(xyValues[0][judgementCount]))   // scaling the x axis values to the width of the rectangle
      .attr("height", paddedHeightX);   // the blue rectangle on the left (representing X axis value) has a height of set size with padding

  var closeGuess = false;
  var selection_made = false;
  var spaced = false;
  var selection_made = false;

  function blueYRect(yValue){
    return svgY.append("rect")
      .attr('id',"temp_blue")
      .attr('x', 2)
      .attr('y', yValue)
      .style('stroke', 'steelblue')
      .style('fill', 'steelblue')
      .attr("width", paddedWidthY)
      .attr("height", paddedHeightY-yValue);
  }
  function redYRect(){
    if (currentMode.includes("train")) {
      var feedback = scaleY(xyValues[1][judgementCount]);
      svgY.append("rect")
        .attr('id',"temp_red")
        .attr('x', 2)
        .attr('y', paddedHeightY-feedback)
        .attr("width", paddedWidthY)
        .attr("height", feedback)
        .style('stroke', 'red')
        .style('fill', 'red');
    }
  }
  function clicked(d){

    if (d3.event.defaultPrevented) return; // dragged
    var coord = Math.round(Number(d3.mouse(this)[1]));
    if(coord>=2 && coord<=paddedHeightY){ // TODO: should 0 be allowed as a target value? (where target == 0 means coord == paddedHeightY == 500)
      selection_made = true;
      var target = paddedHeightY-coord;
      var blueRect, redRect;
      if(spaced === false){
        svgY.select("#temp_blue").remove();
        blueRect = blueYRect(coord);
      } else {
        if (scaleY(xyValues[1][judgementCount])<target) {
          svgY.select("#temp_blue").remove();
          blueRect = blueYRect(coord);
          redYRect();

        }
        else {
          svgY.select("#temp_red").remove();
          svgY.select("#temp_blue").remove();
          redYRect();
          blueRect = blueYRect(coord);
        }
      }
      if ((Math.abs(scaleY(xyValues[1][judgementCount])-target)<25)||(currentMode.includes("test"))) {
        closeGuess = true;
      }
      selection_made = true;

      document.onkeyup = function(e) {
        var key = e.keyCode || e.which;
        if (key === 32 && selection_made) {
          console.log("space");
          spaced = true;
          redYRect();
          if (scaleY(xyValues[1][judgementCount])<target) {
          }
          else {
            svgY.select("#temp_blue").remove();
            blueRect = blueYRect(coord);
          }
        }

        if (key === 13 && selection_made && closeGuess) {      // TODO: in training should we force the user to see feedback or check for feedback (enter not allowed until after space)
          submittedPoints.push(target);
          closeGuess = false;
          judgementCount += 1;
          if(judgementCount!=40){
            console.log("enter");
            document.getElementById('judgementCount').innerHTML = "Judgment "+(judgementCount+1)+" out of 40";
            svgY.select("#temp_blue").remove();
            svgY.select("#temp_red").remove();
            svgY.selectAll("#temp_red").remove();
            blueXRect
              .attr("width", scaleX(xyValues[0][judgementCount]));
            spaced = false;
            selection_made = false;
          }
          else {
            svgY.on("click", function(d){});
            document.querySelector(".nextScenarioButton").style="display:inline";
            console.log(submittedPoints);
            submitPoints(submittedPoints);
            //  localStorage.setItem('JSON_output', JSON.stringify(obj));
            svgY.select("#temp_blue").remove();
            svgX.select("#left_blue").remove();
          }
        }
      }
    }
  }

  document.querySelector(".nextScenarioButton").onclick = function() {
    finishedConditions[currentCondition] = true;
    currentCondition += 1;
    checkStatus();
  }
}

function scatterNoMemPlot(xyValues){}
function scatterFullMemPlot(xyValues){}
function submitPoints(){}

function checkStatus(){
  document.querySelector(".instructionText").innerHTML = "";
  document.querySelector(".container").innerHTML = "";

  if(currentMode.includes("train")){
      currentMode = "test";
      displayInstructions(currentMode+"-"+expCondition[0]);
      document.querySelector(".container").innerHTML = "";
      document.querySelector(".nextScenarioButton").style="display:none";
      document.querySelector("#mode").innerHTML = "Testing mode";
      presentationDict[expCondition[0]]([xyValues[0].slice(40,80),xyValues[1].slice(40,80)],currentMode,expCondition);
      //presentationDict[expCondition[0]](xyValues,mode);
  }
  else {
    if(currentCondition < finishedConditions.length){
      /* GENERATING RANDOM CONDITION*/
      expCondition = randomCondition();
      console.log(expCondition);

      /* CONSTRUCTING FUNCTION'S X AND Y ARRAYS*/
      var positions = Array.apply(null, {length: 80}).map(Number.call, Number);
      var xValue = positions.map(function(x) { return x+1; });
      var yValue = xValue.map(function(x) { return functionDict[expCondition[1]](x); });
      xyValues = [xValue,yValue];

      /* DISPLAYING INSTRUCTIONS */
      currentMode = "train";
      displayInstructions(currentMode+"-"+expCondition[0]);
      document.querySelector(".container").innerHTML = "";
      document.querySelector(".nextScenarioButton").style="display:none";
      document.querySelector("#mode").innerHTML = "Training mode";
      presentationDict[expCondition[0]]([xValue.slice(0,40),yValue.slice(0,40)],currentMode,expCondition);
      //presentationDict[expCondition[0]](xyValues,mode);
    }
    else {
      thankyou();
    }
  }
}

function startExperiment(){
  document.querySelector("#mode").style="display:inline";
  document.querySelector("#judgementCount").style="display:inline";
  document.querySelector(".smth").remove();
  var parent = document.querySelector("#main");
  parent.className = "col-md-9 jumbotron vertical-center";
  var smth = document.createElement('div');
  smth.className = "container";
  parent.appendChild(smth);
  checkStatus();
}

function introduction(){
  document.querySelector("#mode").style="display:none";
  document.querySelector("#judgementCount").style="display:none";
  loadJSON('exp_input.json', function(data){
    document.querySelector(".instructionText").innerHTML = JSON.parse(data)["frontpage"];
    var smth = document.createElement('div')
    smth.className = "smth";
    var parent = document.querySelector(".vertical-center");
    parent.className = "col-md-9 jumbotron";
    parent.appendChild(smth);
    document.querySelector(".smth").innerHTML = JSON.parse(data)["consentform"];
  });
}

function thankyou(){
  document.querySelector(".container").innerHTML = "";
  loadJSON('exp_input.json', function(data){
    document.querySelector(".instructionText").innerHTML = JSON.parse(data)["conclusion"];
  });
}

/********  MAIN  **********/

var debugmode = true;       // TODO: shouldn't we introduce more randomness in the functions/ or make restrictions, users can get linear bar charts twice?

var functionDict = {
  "linear": function(x) {return 2*x+1;},
  "quadratic": function(x) {return x*x;},
  "periodic": function(x) {return Math.sin(x*(Math.PI/180))+1;},
};

var presentationDict = {
  "bar": function(x,y,z) {barPlot(x,y,z);},
  "scatter-nomem": function(x) {scatterNoMemPlot();},
  "scatter-fullmem": function(x) {scatterFullMemPlot();}
};

/* GENERATING IDENTIFIERS*/
var sessionID = Math.random();

/* ESTABLISHING NUMBER OF CONDITIONS */
var finishedConditions = [false,false,false];
var currentCondition = 0;
var currentMode = "test";
var xyValues;

var expCondition;

introduction();
