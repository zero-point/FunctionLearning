// save chosen linear,etc functions in JSON to be recovered and lists of no's generated
// depending on the condition, a different JSON element is chosen and fed into a function (together with the pres style)
// that function then creates the bar/scatter plot with the given data
// TODO: alert/ infobox if user doesn't do anything

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
 
function getCondition(){
  var loc = "";
  if (!conditionID) {
    var p = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    var f = [[0, 1, 2], [1, 2, 0], [2, 0, 1]];
    var pt = ["0", "1", "2"];
    var ft = ["0", "1", "2"];
    var allConditions = [];
    for (var i = 0; i < 3; i++) {
      for (var j = 0; j < 3; j++) {
        var a = "";
        for (var k = 0; k < 3; k++) {
          a += pt[p[i][k]] + ft[f[j][k]] + "";
        }
        allConditions.push(a);
      }
    }
    conditionID = allConditions[Math.floor(Math.random() * 9)];
    loc = conditionID.substring((currentCondition-1)*2,currentCondition*2);
  }
  else {
    loc = conditionID.substring((currentCondition-1)*2,currentCondition*2);
  }
  var presentationTypes = ["bar","scatter-nomem","scatter-fullmem"];
  var functionTypes = ["linear","quadratic","periodic"];
  var randPres = presentationTypes[loc[0]];
  var randFunc = functionTypes[loc[1]]; 
  currentConditionNames = [randPres, randFunc];
  currentConditionCodes = [loc[0], loc[1]];
  return [randPres,randFunc,presentationTypes.indexOf(randPres),functionTypes.indexOf(randFunc)];
}

function closeMsg() {
  document.querySelector("#myNav").style.width = "0%";
  document.querySelector(".overlay-content").innerHTML = "";
  document.onkeyup = function(e) {};
  document.onclick = function() {};
}

function openMsgNext() {
  document.querySelector(".overlay-content").innerHTML = "";
  var text = document.createElement('a');
  text.classList.add('unselectable');
  if (currentMode.includes("train")) {
      text.innerHTML = "You've finished the training for this task.<br/><br/> Click 'Next' to move to the testing.";
  }
  else {
    text.innerHTML = "You've finished the experiment.<br/><br/> Click 'Next' to go to the survey.";
  }
  text.innerHTML += "<br/><br/><button type=\"button\" onclick=\"checkStatus()\" class=\"btn btn-primary btn-lg nextScenarioButton\">Next</button>";
  document.querySelector(".overlay-content").appendChild(text);
  document.querySelector("#myNav").style.width = "100%";
}

function openMsg(closeGuess, judgementCount, currentMode){
  document.querySelector(".overlay-content").innerHTML = "";
  var text = document.createElement('a');
  text.classList.add('unselectable');
  if (currentMode.includes("train")) {
    if (closeGuess) {
        text.innerHTML = "Good job! <br/><br/> " + (totalJudgements-judgementCount) + " more to go";
    }
    else {
      text.innerHTML = "Not quite, update your choice<br/> to match the feedback in red";
    }
  }
  else {
    text.innerHTML = "" + (totalJudgements-judgementCount) + " more to go";
  }
  text.innerHTML += "<br/><br/><br/>(Press any key or click to continue)";
  document.querySelector(".overlay-content").appendChild(text);
  document.querySelector("#myNav").style.width = "100%";
  document.onkeyup = function(e) {closeMsg();};
  document.onclick = function() {closeMsg();};
}

function openAlert(msg){
  document.querySelector(".overlay-content").innerHTML = "";
  var text = document.createElement('a');
  text.innerHTML = msg;
  text.innerHTML += "<br/><br/><button type=\"button\" onclick=\"closeMsg()\" class=\"btn btn-primary btn-lg nextScenarioButton\">OK</button>";
  document.querySelector(".overlay-content").appendChild(text);
  document.querySelector("#myNav").style.width = "100%";
}

function displayInstructions(condition){
  loadJSON('exp_input.json', function(data){
    var parsed_data = JSON.parse(data);
    document.querySelector(".instructionText").classList.add('unselectable');
    document.querySelector(".instructionText").innerHTML = parsed_data["instructions"][condition];
  });
}

var delay = (function() {
  var timer = 0;
  return function(callback, ms) {
    clearTimeout(timer);
    timer = setTimeout(callback, ms);
  };
})();

function barPlot(xyValues, currentMode, expCondition){

  var horiz = document.createElement('div');
  var vert = document.createElement('div');
  var space = document.createElement('div');
  space.className = "col-md-1";

  document.querySelector(".container").appendChild(horiz);
  document.querySelector(".container").appendChild(space);
  document.querySelector(".container").appendChild(vert);

  if(debugmode){
    judgementCount = totalJudgements-5;
    document.getElementById('judgementCount').innerHTML = "Judgement "+(judgementCount+1)+" out of "+totalJudgements;
  }
  else {
    judgementCount = 0;
  }

  var closeGuess = false;
  var selection_made = false;
  var spaced = false;
  var selection_made = false;

  /* size of black containers */
  var widthX = containerDim+margins*2,
    heightX = 100,
    widthY = 100,
    heightY = containerDim+margins*2,                      // TODO: should the size of the plots be relative to the users' screen?
    paddedHeightY = heightY-margins,
    paddedWidthX = widthX-margins,
    paddedHeightX = heightX-margins*2,
    paddedWidthY = widthY-margins*2;

  /* scale of blue rectangles*/
  var blueWidthX = containerDim,
    blueHeightY = containerDim,
    scaleX,
    scaleY;

  xValue = xyValues[0];
  yValue = xyValues[1];
  scaleX = d3.scaleLinear()
    .domain([Math.min.apply(null, xValue), Math.max.apply(null, xValue)])
    .range([1, blueWidthX]);
  scaleY = d3.scaleLinear()
    .domain([Math.min.apply(null, yValue), Math.max.apply(null, yValue)])
    .range([blueHeightY*1/6,blueHeightY*5/6]);

  var scaledYValues = [];
  for(var i=0; i<yValue.length; i++){
	scaledYValues.push(scaleY(yValue[i]));
  }

  scaledTrueValues = [xValue,scaledYValues]; 

  if (currentMode.includes("train")) {
     xyValues = [xValue.slice(0,totalJudgements),yValue.slice(0,totalJudgements)];
  }
  else {
     xyValues = [xValue.slice(totalJudgements,totalJudgements*2),yValue.slice(totalJudgements,totalJudgements*2)];
  }

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
      .attr('x', margins)
      .attr('y', margins)
      .style('stroke', 'steelblue')
      .style('fill', 'steelblue')
      .attr("width", scaleX(xyValues[0][judgementCount]))   // scaling the x axis values to the width of the rectangle
      .attr("height", paddedHeightX);   // the blue rectangle on the left (representing X axis value) has a height of set size with padding

  if(debugmode){
    var debugYRectMax = svgY.append("rect")
      .attr('x', margins)
      .attr('y', paddedHeightY-scaleY(Math.max.apply(null, yValue)))
      .attr("width", paddedWidthY)
      .attr("height", scaleY(Math.max.apply(null, yValue))-scaleY(Math.min.apply(null, yValue)))
      .style('stroke', 'green')
      .style('fill', 'transparent');
    var errorMargin = svgY.append("svg:rect")
      .attr('x', margins)
      .attr('y', paddedHeightY - scaleY(xyValues[1][judgementCount]) - accErrorMargin*heightY/2)
      .style('stroke', 'red')
      .style('fill', 'transparent')
      .attr('width', paddedWidthY)
      .attr('height', accErrorMargin*heightY);
  }
  function blueYRect(yValue){
    return svgY.append("rect")
      .attr('id',"temp_blue")
      .attr('x', margins)
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
        .attr('x', margins)
        .attr('y', paddedHeightY-feedback)
        .attr("width", paddedWidthY)
        .attr("height", feedback)
        .style('stroke', 'red')
        .style('fill', 'red');
    }
  }
  var submitted = false;
  openDescr(currentMode+"-"+expCondition[0]);
  var finished = true;
  var tempListOfAttValues = [];
  var tempListOfAccValues = [];
  var tempListOfAllValues = [];
  function clicked(d){
    if (d3.event.defaultPrevented) return; // dragged
    var coord = Math.round(Number(d3.mouse(this)[1]));
    if(coord>=margins && coord<=paddedHeightY){ // TODO: should 0 be allowed as a target value? (where target == 0 means coord == paddedHeightY == 500)
      selection_made = true;
      var target = paddedHeightY-coord;
      chosenPoints.push(target);
      var blueRect, redRect;
      var trueValue = scaleY(xyValues[1][judgementCount]);
      if(spaced === false){
        svgY.select("#temp_blue").remove();
        blueRect = blueYRect(coord);
      }
      else {
        if (trueValue<target) {
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
      selection_made = true;
      document.onkeyup = function(e) {
        var key = e.keyCode || e.which;
        if(key === 32 && selection_made && finished){
          finished = false;
          var savedAllInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
          tempListOfAllValues.push(savedAllInfo);
          delay(function(){
          if (judgementCount != totalJudgements) {
            redYRect();
            if (trueValue >= target) {
              svgY.select("#temp_blue").remove();
              blueRect = blueYRect(coord);
            }
            if (Math.abs(trueValue - target) <= accErrorMargin*heightY/2 || currentMode.includes("test")) {
              closeGuess = true;
            }
            if (closeGuess) {
              var mTimer2 = setTimeout(function() {
              // TODO: in training should we force the user to see feedback or check for feedback (enter not allowed until after space)
              submittedPoints.push(target);
              var savedAccInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
              tempListOfAccValues.push(savedAccInfo);
              closeGuess = false;
              if (tempListOfAttValues !== undefined && tempListOfAttValues.length !== 0) {
                attemptedSubmissions.push(tempListOfAttValues);
              }
              acceptedSubmissions.push(tempListOfAccValues);
              allSubmissions.push(tempListOfAllValues);
              tempListOfAttValues = [];
              tempListOfAccValues = [];
              tempListOfAllValues = [];

              judgementCount += 1;
              if (judgementCount != totalJudgements) {
                  openMsg(true, judgementCount, currentMode);
                  document.getElementById("judgementCount").innerHTML = "Judgement " + (judgementCount + 1) + " out of "+totalJudgements;
                  svgY.select("#temp_blue").remove();
                  svgY.select("#temp_red").remove();
                  svgY.selectAll("#temp_red").remove();
                  blueXRect.attr("width", scaleX(xyValues[0][judgementCount]));
                  if(debugmode){
                    errorMargin 
                      .attr('y', paddedHeightY - trueValue - accErrorMargin*heightY/2)
                      .attr('height', accErrorMargin*heightY);
                  }
                  selection_made = false;
                  finished = true;
              } else {
                finished = true;
                document.onkeyup = function(e) {};
                document.onclick = function() {};
                //svgY.on("click", function(d) {});
                //d3.select(".container").selectAll("svg").remove();
                finishedConditions[currentCondition-1] = true;        
                if(!submitted){      
                  if(currentMode.includes("test")){
                    submitPoints(false);    
                  }
                  submitted = true;
                  openMsgNext();
                }
              }
              }, 600);
            } else {
              var savedAttInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
              tempListOfAttValues.push(savedAttInfo);
              finished = true;
              openMsg(false, judgementCount, currentMode);
            }
          } else {
            finished = true;
            document.onkeyup = function(e) {};
            document.onclick = function() {};
            //svgY.on("click", function(d) {});
            //d3.select(".container").selectAll("svg").remove();
            finishedConditions[currentCondition-1] = true;       
            if(!submitted){      
              if(currentMode.includes("test")){
                submitPoints(false);    
              }
              submitted = true;       
              openMsgNext();
            }
          }
          }, 0);
        }
      }
    }
  }
}

function scatterFullMemPlot(xyValues,currentMode,expCondition){
  var content = document.createElement('div');
  content.className = "content";
  document.querySelector(".container").appendChild(content);

  if(debugmode){
    judgementCount = totalJudgements-5;
    document.getElementById('judgementCount').innerHTML = "Judgement "+(judgementCount+1)+" out of "+totalJudgements;
  }
  else {
    judgementCount = 0;
  }

  var closeGuess = false;
  var selection_made = false;
  var spaced = false;
  var selection_made = false;
  var circle_size = 4;

  var containerWidth = containerDim,
      containerHeight = containerDim;

  var chart = d3.select('.content')
  .append('svg')
  .attr('width', containerWidth)
  .attr('height', containerHeight)
  .attr("style", "outline: 2px solid black;");

  var margin = {top: margins, right: margins, bottom: margins, left: margins};
  var width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

  var outline = chart
    .append('rect')
    .attr('x',margin.left)
    .attr('y',margin.top)
    .attr('width', width)
    .attr('height', height)
    .style('stroke', '#5b9baf')
    .style('fill', 'transparent')

  var scaleX,
      scaleY;

  xValue = xyValues[0];
  yValue = xyValues[1];
  scaleX = d3.scaleLinear()
    .domain([Math.min.apply(null, xValue), Math.max.apply(null, xValue)])
    .range([1, width]);
  scaleY = d3.scaleLinear()
    .domain([Math.min.apply(null, yValue), Math.max.apply(null, yValue)])
    .range([height*5/6,height*1/6]);

  var scaledYValues = [];
  for(var i=0; i<yValue.length; i++){
	scaledYValues.push(scaleY(yValue[i]));
  }

  scaledTrueValues = [xValue,scaledYValues]; 

  if (currentMode.includes("train")) {
     xyValues = [xValue.slice(0,totalJudgements),yValue.slice(0,totalJudgements)];
  }
  else {
     xyValues = [xValue.slice(totalJudgements,totalJudgements*2),yValue.slice(totalJudgements,totalJudgements*2)];
  }

  var currloc = margin.left + scaleX(xyValues[0][judgementCount]);
  for (var i = 0; i < xValue.length; i++) {
    chart.append("circle")
        .attr("id","true")
        .attr("cx", margin.left + scaleX(xValue[i]))
        .attr("cy", margin.bottom + scaleY(yValue[i]))
        .attr("r", circle_size)
        .style("stroke", "orange")
        .style("fill", "transparent");
  }

  if (currentMode.includes("test")) {
    for (var i = 0; i < xValue.length/2; i++) {
      chart.append("circle")
          .attr("id","true")
          .attr("cx", margin.left + scaleX(xValue[i]))
          .attr("cy", margin.bottom + scaleY(yValue[i]))
          .attr("r", circle_size)
          .style("stroke", "red")
          .style("fill", "red");
    }
  }

  var redLine = chart.append("svg:line")
    .attr("id", "redLine")
    .attr("x1", currloc)
    .attr("y1", 0)
    .attr("x2", currloc)
    .attr("y2", height + margin.top + margin.bottom)
    .style("stroke-width", 2)
    .style("stroke", "red")
    .style("fill", "none");

  var widthOfBuffer = 40;
  var errorMargin = chart.append("svg:rect")
    .attr('x', currloc - widthOfBuffer/2)
    .attr('y', margin.top + scaleY(xyValues[1][judgementCount]) - accErrorMargin*height/2)
    .style('stroke', 'blue')
    .style('fill', 'transparent')
    .attr('width', widthOfBuffer)
    .attr('height', accErrorMargin*height);

  var feed = chart
    .append("circle")
    .attr("id", "feed")
    .attr("cx", currloc)
    .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
    .attr("r", circle_size)
    .style("fill", "transparent");

  var buffer = chart
    .append("svg:rect")
    .attr("x", currloc - widthOfBuffer/2)
    .attr("y", margin.top)
    .style("stroke", "#add8e6")
    .style("fill", "transparent")
    .attr("width", widthOfBuffer)
    .attr("height", height)
    .on("click", clicked);

  if(!debugmode){
    buffer.style("stroke", "transparent");
    chart.selectAll("rect").style('stroke', 'transparent');
    chart.selectAll("#true").style('stroke', 'transparent');
  }

  openDescr(currentMode+"-"+expCondition[0]);
  var last_sel_circle;
  var submitted = false;
  var finished = true;
  var tempListOfAttValues = [];
  var tempListOfAccValues = [];
  var tempListOfAllValues = [];
  function clicked(d, i) {
    if (d3.event.defaultPrevented) return; // dragged
    d3.select(this).on('mousedown.drag', null);
    var coordinates = d3.mouse(d3.select('.content').node());
    var target = coordinates[1];
    chosenPoints.push(target);
    if (chart.select("#last") != undefined){
      chart.select("#last").remove();
    }
    last_sel_circle = chart
      .append("circle")
      .attr("id","last")
      .attr("transform", "translate(" + [currloc,target] + ")")
      .attr("r", circle_size);
    selection_made = true;
    var trueValue = scaleY(xyValues[1][judgementCount]);
    // SPACE KEY SAVES DATA
    document.onkeyup = function(e) {
      var key = e.keyCode || e.which;
      if(key === 32 && selection_made && finished){
        finished = false;
        var savedAllInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
        tempListOfAllValues.push(savedAllInfo);
        delay(function(){
          if (judgementCount != totalJudgements) {
            if (Math.abs(trueValue - target) <= accErrorMargin*height/2 || currentMode.includes("test")) {
              closeGuess = true;
            }
            if (closeGuess) {
              var savedAccInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
              tempListOfAccValues.push(savedAccInfo);
              submittedPoints.push(target);
              closeGuess = false;
              if (currentMode.includes("train")) {
                chart.append("circle")
                  .attr("cx", currloc )
                  .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
                  .attr("r", circle_size)
                  .style("fill", "red");
              } else {
                chart.append("circle")
                  .attr("cx", currloc )
                  .attr("cy", target)
                  .attr("r", circle_size)
                  .style("fill", "steelblue");
              }                
              buffer
                .attr("x", currloc - widthOfBuffer/2)
                .attr("y", margin.top)
                .attr("width", widthOfBuffer)
                .attr("height", height)
                .on("click", clicked);

              if (tempListOfAttValues !== undefined && tempListOfAttValues.length !== 0) {
                attemptedSubmissions.push(tempListOfAttValues);
              }
              acceptedSubmissions.push(tempListOfAccValues);
              allSubmissions.push(tempListOfAllValues);
              tempListOfAttValues = [];
              tempListOfAccValues = [];
              tempListOfAllValues = [];
              //console.log(attemptedSubmissions)
              //console.log(acceptedSubmissions);
              //console.log(allSubmissions);

              judgementCount += 1;
              if(judgementCount!=totalJudgements){
                openMsg(true, judgementCount, currentMode);
                document.getElementById('judgementCount').innerHTML = "Judgement "+(judgementCount+1)+" out of "+totalJudgements;
                if (chart.select("#last") != undefined){
                  chart.select("#last").remove();
                }
                currloc = margin.left + scaleX(xyValues[0][judgementCount]);
                redLine.attr("x1", currloc)
                      .attr("x2", currloc);
                errorMargin
                  .attr('x', currloc - widthOfBuffer/2)
                  .attr('y', margin.top + scaleY(xyValues[1][judgementCount]) - accErrorMargin*height/2)
                  .attr('width', widthOfBuffer)
                  .attr('height', accErrorMargin*height);
                buffer.attr('x', currloc-20);
                selection_made = false;
                finished = true;
              }
              else {
                //buffer.on("click", function(d){});
                //d3.select(".content").selectAll("svg").remove();
                finishedConditions[currentCondition-1] = true;   
                finished = true;     
                if (!submitted) {
                  if(currentMode.includes("test")){
                    submitPoints(false);    
                  }
                  submitted = true;
                  openMsgNext();
                }      
              }
            }
            else {
                var savedAttInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
                tempListOfAttValues.push(savedAttInfo);
                if (currentMode.includes("train")) {
                  feed.attr("cx", currloc )
                      .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
                      .attr("r", circle_size)
                      .style("fill", "red");
                }
              finished = true;
              openMsg(false, judgementCount, currentMode);
            }
          } else {
            finished = true;
            document.onkeyup = function(e) {};
            document.onclick = function() {};
            //svgY.on("click", function(d) {});
            //d3.select(".container").selectAll("svg").remove();
            finishedConditions[currentCondition-1] = true;     
            if(!submitted){   
              if(currentMode.includes("test")){
                submitPoints(false);    
              }   
              submitted = true;
              openMsgNext();
            }
          }
        }, 0);
      }
    }
  }
}

function scatterNoMemPlot(xyValues,currentMode,expCondition){

  var content = document.createElement('div');
  content.className = "content";
  document.querySelector(".container").appendChild(content);

  if(debugmode){
    judgementCount = totalJudgements-5;
    document.getElementById('judgementCount').innerHTML = "Judgement "+(judgementCount+1)+" out of "+totalJudgements;
  }
  else {
    judgementCount = 0;
  }

  var closeGuess = false;
  var selection_made = false;
  var spaced = false;
  var selection_made = false;
  var circle_size = 4;

  var containerWidth = containerDim,
      containerHeight = containerDim;

  var chart = d3.select('.content')
  .append('svg')
  .attr('width', containerWidth)
  .attr('height', containerHeight)
  .attr("style", "outline: 2px solid black;");

  var margin = {top: margins, right: margins, bottom: margins, left: margins};
  var width = containerWidth - margin.left - margin.right,
      height = containerHeight - margin.top - margin.bottom;

  var outline = chart
    .append('rect')
    .attr('x',margin.left)
    .attr('y',margin.top)
    .attr('width', width)
    .attr('height', height)
    .style('stroke', '#5b9baf')
    .style('fill', 'transparent')

  var scaleX,
      scaleY;

  xValue = xyValues[0];
  yValue = xyValues[1];
  scaleX = d3.scaleLinear()
    .domain([Math.min.apply(null, xValue), Math.max.apply(null, xValue)])
    .range([1, width]);
  scaleY = d3.scaleLinear()
    .domain([Math.min.apply(null, yValue), Math.max.apply(null, yValue)])
    .range([height*5/6,height*1/6]);

  var scaledYValues = [];
  for(var i=0; i<yValue.length; i++){
	scaledYValues.push(scaleY(yValue[i]));
  }

  scaledTrueValues = [xValue,scaledYValues]; 

  if (currentMode.includes("train")) {
     xyValues = [xValue.slice(0,totalJudgements),yValue.slice(0,totalJudgements)];
  }
  else {
     xyValues = [xValue.slice(totalJudgements,totalJudgements*2),yValue.slice(totalJudgements,totalJudgements*2)];
  }

  var currloc = margin.left + scaleX(xyValues[0][judgementCount]);
  for (var i = 0; i < xValue.length; i++) {
    chart.append("circle")
        .attr("id","true")
        .attr("cx", margin.left + scaleX(xValue[i]))
        .attr("cy", margin.bottom + scaleY(yValue[i]))
        .attr("r", circle_size)
        .style("stroke", "orange")
        .style("fill", "transparent");
  }

  var redLine = chart.append("svg:line")
    .attr("id", "redLine")
    .attr("x1", currloc)
    .attr("y1", 0)
    .attr("x2", currloc)
    .attr("y2", height + margin.top + margin.bottom)
    .style("stroke-width", 2)
    .style("stroke", "red")
    .style("fill", "none");

  var widthOfBuffer = 40;
  var errorMargin = chart.append("svg:rect")
    .attr('x', currloc - widthOfBuffer/2)
    .attr('y', margin.top + scaleY(xyValues[1][judgementCount]) - accErrorMargin*height/2)
    .style('stroke', 'blue')
    .style('fill', 'transparent')
    .attr('width', widthOfBuffer)
    .attr('height', accErrorMargin*height);

  openDescr(currentMode+"-"+expCondition[0]);
  var last_sel_circle;

  var feed = chart.append("circle")
      .attr("id","feed")
      .attr("cx", currloc )
      .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
      .attr("r", circle_size)
      .style("fill", "transparent");

  var buffer = chart
    .append("svg:rect")
    .attr("x", currloc - widthOfBuffer / 2)
    .attr("y", margin.top)
    .style("stroke", "#add8e6")
    .style("fill", "transparent")
    .attr("width", widthOfBuffer)
    .attr("height", height)
    .on("click", clicked);

  if (!debugmode) {
    buffer.style("stroke", "transparent");
    chart.selectAll("rect").style("stroke", "transparent");
    chart.selectAll("#true").style("stroke", "transparent");
  }
  var submitted = false;
  var finished = true;
  var tempListOfAttValues = [];
  var tempListOfAccValues = [];
  var tempListOfAllValues = [];
  function clicked(d, i) {
    if (d3.event.defaultPrevented) return; // dragged
    d3.select(this).on('mousedown.drag', null);
    var coordinates = d3.mouse(d3.select('.content').node());
    var target = coordinates[1];
    chosenPoints.push(target);
    if (chart.select("#last") != undefined){
      chart.select("#last").remove();
    }
    last_sel_circle = chart.append("circle")
      .attr("id","last")
      .attr("transform", "translate(" + [currloc,target] + ")")
      .attr("r", circle_size);
    selection_made = true;

    var trueValue = margin.top + scaleY(xyValues[1][judgementCount]);

    // SPACE KEY SAVES DATA
    document.onkeyup = function(e) {
      var key = e.keyCode || e.which;
      if(key === 32 && selection_made && finished){
        finished = false;
        var savedAllInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
        tempListOfAllValues.push(savedAllInfo);
        delay(function(){
          if (judgementCount != totalJudgements) {
            if (Math.abs(trueValue - target) <= accErrorMargin*height/2 || currentMode.includes("test")) {
              closeGuess = true;
            }
            if (closeGuess) {
              var savedAccInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
              tempListOfAccValues.push(savedAccInfo);
              if(currentMode.includes("train")){
                chart.append("circle")
                  .attr("id","feed")
                  .attr("cx", currloc )
                  .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
                  .attr("r", circle_size)
                  .style("fill", "red");
              }
              submittedPoints.push(target);
              closeGuess = false;

              if (tempListOfAttValues !== undefined && tempListOfAttValues.length !== 0) {
                attemptedSubmissions.push(tempListOfAttValues);
              }
              acceptedSubmissions.push(tempListOfAccValues);
              allSubmissions.push(tempListOfAllValues);
              tempListOfAttValues = [];
              tempListOfAccValues = [];
              tempListOfAllValues = [];

              judgementCount += 1;
              if (judgementCount != totalJudgements) {
                var mTimerScatter = setTimeout(function(){ 
                  chart.selectAll("#feed")
                        .style("fill", "transparent");
                  chart.select("#last").remove();
                  openMsg(true, judgementCount, currentMode);
                  document.getElementById("judgementCount").innerHTML = "Judgement " + (judgementCount + 1) + " out of " + totalJudgements;
                  currloc = margin.left + scaleX(xyValues[0][judgementCount]);
                  redLine.attr("x1", currloc).attr("x2", currloc);
                  errorMargin
                    .attr("x", currloc-widthOfBuffer/2)
                    .attr("y", margin.top + scaleY(xyValues[1][judgementCount]) - accErrorMargin*height/2)
                    .attr('width', widthOfBuffer)
                    .attr('height', accErrorMargin*height);
                  buffer.attr("x", currloc-20);
                  selection_made = false;
                  finished = true;
                }, 600);
              } else {
                finished = true;
                document.onkeyup = function(e) {};
                document.onclick = function() {};
                //svgY.on("click", function(d) {});
                //d3.select(".container").selectAll("svg").remove();
                finishedConditions[currentCondition-1] = true;        
                if(!submitted){    
                  if(currentMode.includes("test")){
                    submitPoints(false);    
                  }  
                  submitted = true;
                  openMsgNext();
                }
              }
            }
            else {
              var savedAttInfo = {currentMode: currentMode, judgement: judgementCount+1, x: xyValues[0][judgementCount], scaledX: scaleX(xyValues[0][judgementCount]), trueY:trueValue, predY: target, timestamp: Date.now()};
              tempListOfAttValues.push(savedAttInfo);
              finished = true;
              if (currentMode.includes("train")) {
                feed
                    .attr("id","feed")
                    .attr("cx", currloc )
                    .attr("cy", margin.top + scaleY(xyValues[1][judgementCount]))
                    .attr("r", circle_size)
                    .style("fill", "red");
              }
              openMsg(false, judgementCount, currentMode);
            }
          } else {
            finished = true;
            document.onkeyup = function(e) {};
            document.onclick = function() {};
            //svgY.on("click", function(d) {});
            //d3.select(".container").selectAll("svg").remove();
            finishedConditions[currentCondition-1] = true;        
            if(!submitted){   
              if(currentMode.includes("test")){
                submitPoints(false);    
              }   
              submitted = true;
              openMsgNext();
            }
          }
        }, 0);
      }
    }
  }
}

function submitPoints(completed){

    if(!completed) return;
    var dataChunk = {
      'experimentId': experimentID,     // this project ID
      'sessionId': sessionID,           // the user session ID
      'conditionId': conditionID,       // the condition ID
      'debugmode': debugmode,           // debug or live
      'completed': completed,           // user finished all tasks
      //'finishedConditions': finishedConditions, // tasks finished   // redundant
      //'currentCondition': currentCondition,  // current task        // redundant
      'currentConditionNames': currentConditionNames,
      'currentConditionCodes': currentConditionCodes,
      'currentMode': currentMode,
      'startTime': startTime,
      'endTime': new Date().toJSON(),
      'expData': {
        //"allTrueValues": allTrueValues,                             // redundant
        //"scaledTrueValues": scaledTrueValues,                       // redundant
        "allChosenPoints": chosenPoints,
        //"allSubmittedPoints": submittedPoints,                      // redundant
      	"attemptedSubmissions": attemptedSubmissions,
        "acceptedSubmissions": acceptedSubmissions,
        "allSubmissions": allSubmissions,
      },
      'surveyResp': surveyResp
    }

    var testChunk = {
      'experimentID': 'test',
      'sessionId': 'test',
      'expData': {
        "chosenPoints": chosenPoints,
        "submittedPoints": submittedPoints
      }
    }

  try { 
    chunker.sendChunk(dataChunk);
  } catch (e) {
    throw new Error('Sending data to server was unsuccessful: '+e);
  }
  return;
}

function ChunkWs (theChunkUrl,messageCallback) {
    this.chunkUrl = theChunkUrl;
    this.wso = new WebSocket(this.chunkUrl);
    this.wsError = 0;
    this.doneState = 0;
    var self = this; // Can't use 'this' to refer to object inside functions
    this.wso.onmessage = function(event) {
        message = JSON.parse(event.data);
        console.log('received websocket message: ' + message);
        console.log('this: ' + JSON.stringify(self));
        messageCallback(self.doneState,self.wsError,message);
    }

    this.wso.onerror = function(error){
        console.log('websocket error detected: ' + JSON.stringify(error));
        self.wsError = 1;
    }

    this.sendChunk = function(dataChunk) {
         if(dataChunk['experimentId'] == null) console.error("Requires defined experimentId")
        if(dataChunk['sessionId'] == null) console.error("Requires defined sessionId")
        var dataStr = JSON.stringify(dataChunk);
        self.wso.send(dataStr);
        self.doneState = 1;
    }
}

ChunkWs.prototype = {
    constructor: ChunkWs
}

function checkStatus(){
  closeDescr();
  document.querySelector(".instructionText").innerHTML = "";
  document.querySelector(".container").innerHTML = "";
  document.querySelector(".instructions").classList.add("unselectable");

  if(currentMode.includes("train")){
      currentMode = "test";
      displayInstructions(currentMode+"-"+expCondition[0]);
      document.querySelector(".container").innerHTML = "";
      document.querySelector("#mode").innerHTML = "Testing mode";
      document.getElementById("judgementCount").innerHTML = "Judgement 1 out of " + totalJudgements;
      presentationDict[expCondition[0]](xyValues,currentMode,expCondition);
  }
  else {
    currentCondition += 1;
    //document.getElementsByClassName("progress-container")[0].style.display = "inline";
    //var elem = document.getElementsByClassName("progress-bar");
    //elem[0].style.width = "" + ((currentCondition-1) * 33 + 1) + "%";
    //document.getElementsByClassName("tasks")[0].innerHTML = "" + (currentCondition-1) + "/" + "3 Relationships Completed"; 
    //document.getElementsByClassName("tasks")[0].classList.add("unselectable");
    if(currentCondition <= totalNoOfConditions){
      /* GENERATING RANDOM CONDITION*/
      expCondition = getCondition();

      /* CONSTRUCTING FUNCTION'S X AND Y ARRAYS*/
      var positions = Array.apply(null, {length: 80}).map(Number.call, Number);
      var xValue = positions.map(function(x) { return x+1; });
      var yValue = xValue.map(function(x) {return functionDict[expCondition[1]](x);});
      xyValues = [xValue,yValue];
      allTrueValues.push(xyValues);

      /* DISPLAYING INSTRUCTIONS */
      currentMode = "train";
      displayInstructions(currentMode+"-"+expCondition[0]);
      document.querySelector(".container").innerHTML = "";
      //document.querySelector(".nextScenarioButton").style="display:none";
      document.querySelector("#mode").innerHTML = "Training mode";
      document.querySelector("#judgementCount").innerHTML = "Judgement 1 out of " + totalJudgements;
      presentationDict[expCondition[0]](xyValues,currentMode,expCondition);
    }
    else {
      survey();
    }
  }
}

function closeDescr() {
  document.querySelector("#myNav").style.width = "0%";
  document.querySelector(".overlay-content").innerHTML = "";
}

function openDescr(condition){
  var text = document.createElement('a');
  text.innerHTML = "";
  loadJSON('exp_input.json', function(data){
    var temp = JSON.parse(data)["intro-info"][condition];
    text.innerHTML += temp;
    text.innerHTML += "<button type=\"button\" onclick=\"closeDescr()\" class=\"btn btn-primary btn-lg nextTaskButton\">OK</button>";
  });
  text.className = "intro-info";
  text.classList.add("unselectable");
  document.querySelector(".overlay-content").appendChild(text);
  document.querySelector("#myNav").style.width = "100%";
}

function startExperiment(){
  document.querySelector("#mode").style="display:inline";
  document.querySelector("#mode").value="Training mode";
  document.querySelector(".intro").remove();
  var parent = document.querySelector("#main");
  parent.className = "col-md-9 jumbotron vertical-center";
  var intro = document.createElement('div');
  intro.className = "container";
  parent.appendChild(intro);
  checkStatus();
}

function introduction(){
  loadJSON('exp_input.json', function(data){
    document.querySelector(".instructionText").innerHTML = JSON.parse(data)["frontpage"];
    var intro = document.createElement('div')
    intro.className = "intro";
    var parent = document.querySelector("#main");
    parent.className = "col-md-9 jumbotron";
    parent.appendChild(intro);
    document.querySelector(".intro").innerHTML = JSON.parse(data)["consentform"];
  });
}

function survey(){

  loadJSON('exp_input.json', function(data){
    var temp = "";
    var parsed_data = JSON.parse(data);
    document.querySelector("#judgementCount").innerHTML = "";
    document.querySelector("#mode").innerHTML = "";
    document.querySelector(".instructions").classList.remove("unselectable");
    document.querySelector(".instructionText").classList.remove("unselectable");
    document.querySelector(".instructionText").innerHTML = parsed_data["conclusion"];
    var survey = parsed_data["survey"];
    for(var i=0; i<Object.keys(survey).length; i++){
      surveyResp.push({
          key:   i,
          values: []
      });
    }
    temp += "<div class=\"wrap\"><form id=\"formy\">";
    for (var i=0; i<Object.keys(survey).length; i++) {
      if (survey[i]["type"].includes("likert")) {
        var likertAnswers = survey[i]["answers"];
        temp += '<label class="statement" id="statement' + i + '">' + survey[i]["question"] + '</label><ul class="likert">';
        for (var j=0; j<Object.keys(likertAnswers).length; j++){
          temp += "<li><input type=\"radio\" class=\"radio\" name=\"resp" + i + "\"><label>" + likertAnswers[j] + "</label></li>";
        }
      }
      if (survey[i]["type"].includes("closed")) {
        var closedAnswers = survey[i]["answers"];
        temp += "<label class=\"statement\" id=\"statement" + i + "\">" + survey[i]["question"] + "</label><ul class=\"likert short\">";
        for (var j=0; j<Object.keys(closedAnswers).length; j++){
          temp += "<li class=\"check\"><input type=\"checkbox\" name=\"resp" + i + "\"><label>" + closedAnswers[j] + "</label></li>";
        }
      }
      if (survey[i]["type"].includes("open")) {
        temp += '<label class="statement" id="statement' + i + '">' + survey[i]["question"] + '</label><ul class="likert none">';
        temp += "<textarea id=\"open\" name=\"resp" + i + "\" cols=\"40\" rows=\"3\"></textarea>";
      }
      temp += "</ul>";
    }
    temp += "<div class=\"buttons\"><button class=\"clear\">Clear</button><button type=\"submit\" class=\"submit\">Submit</button></div>";
    temp += "</form></div>";
    if (document.querySelector(".container")===null) {
      document.querySelector(".intro").remove();
      var parent = document.querySelector("#main");
      parent.className = "col-md-9 jumbotron vertical-center";
      var intro = document.createElement("div");
      intro.className = "container";
      parent.appendChild(intro);
    }
    document.querySelector(".container").innerHTML = temp;
    document.querySelector("#formy").onsubmit = function(e){e.preventDefault();}
    document.querySelector(".submit").onclick = function() {
      var form = document.getElementById("formy");
      var missingResp = false;
      for (var i=0; i<Object.keys(survey).length; i++){
          var ok = false;
          var radios = form.elements["resp"+i];
          if ( survey[i]["type"].includes("open") ) {
            ok = true;
            surveyResp[i].values.push(document.getElementById("open").value);
          }
          if ( survey[i]["type"].includes("closed") ) {
            ok = true;
          }
          for (var j=0; j<radios.length; j++) {
            if ( radios[j].checked ) {
              ok = true;
              surveyResp[i].values.push(j);
            }
          }
          if (!ok) {
            document.getElementById(["statement"+i]).style.color="red";
            missingResp = true;      
          }
      }
      if(missingResp){
        openAlert("Please answer all the questions");
      }
      else{
        submitPoints(true);    
        document.querySelector(".progress-container").remove();
        document.querySelector(".instructionText").innerHTML = ""; 
        document.querySelector(".container").innerHTML = "";

        document.querySelector("#main").innerHTML = '<h2 id=\"thankyou\">Thank you.<br/><br/> Please copy this code as proof<br/> of your experiment completion:<br/><br/> <b>' + sessionID.substring(0, 4) + "</b></h2>";
      }
	return false;
    };
    document.querySelector(".clear").onclick = function() {
      var form = document.getElementById("formy");
      for (var i=0; i<Object.keys(survey).length; i++){
        if (survey[i]["type"].includes("open")) {
            document.getElementById("open").value = "";
        }
        else {
          var radios = form.elements["resp" + i];
          for (var j=0; j<radios.length; j++) {
            radios[j].checked = false;
          }
        }
      }
    };
  });
}

function getAllUrlParams(url) {
  // get query string from url (optional) or window
  var queryString = url ? url.split("?")[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {
    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split("#")[0];

    // split our query string into its component parts
    var arr = queryString.split("&");

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split("=");

      // in case params look like: list[]=thing1&list[]=thing2
      var paramNum = undefined;
      var paramName = a[0].replace(/\[\d*\]/, function(v) {
        paramNum = v.slice(1, -1);
        return "";
      });

      // set parameter value (use 'true' if empty)
      var paramValue = typeof a[1] === "undefined" ? true : a[1];

      // (optional) keep case consistent
      paramName = paramName.toLowerCase();
      paramValue = paramValue.toLowerCase();

      // if parameter name already exists
      if (obj[paramName]) {
        // convert value to array (if still string)
        if (typeof obj[paramName] === "string") {
          obj[paramName] = [obj[paramName]];
        }
        // if no array index number specified...
        if (typeof paramNum === "undefined") {
          // put the value on the end of the array
          obj[paramName].push(paramValue);
        } else {
          // if array index number specified...
          // put the value at that index number
          obj[paramName][paramNum] = paramValue;
        }
      } else {
        // if param name doesn't exist yet, set it
        obj[paramName] = paramValue;
      }
    }
  }
  return obj;
}

/********  MAIN  **********/
var functionDict = {
  "linear": function(x) {return 2*x+1;},
  "quadratic": function(x) {return x*x;},
  "periodic": function(x) {return Math.sin((x/16+3/2)*Math.PI);},
};

var presentationDict = {
  "bar": function(x,y,z) {barPlot(x,y,z);},
  "scatter-nomem": function(x,y,z) {scatterNoMemPlot(x,y,z);},
  "scatter-fullmem": function(x,y,z) {scatterFullMemPlot(x,y,z);}
};

/* GENERATING IDENTIFIER */
var experimentID = "funMemDebug";
var sessionID;
var conditionID;

var params = getAllUrlParams();
if (params["sid"]) {
  sessionID = params["sid"];
} 
else if(params["sessionid"]){
  sessionID = params["sessionid"];
}
else {
  sessionID = ""+Math.floor((Math.random() * 1000000) + 1);
}

if (params["cid"]) {
  conditionID = params["cid"];
}
else{
  if(params["conditionid"]){
    conditionID = params["conditionid"];
  }
}

/* ESTABLISHING NUMBER OF CONDITIONS */
var totalNoOfConditions = 1;

/* ESTABLISHING EXPERIMENT SIZE */
const totalJudgements = 40; 

/* ESTABLISHING ACCEPTABLE ERROR MARGIN */
const accErrorMargin = 1/10; 

/* SAVING USER INFO */
var startTime = new Date().toJSON(); 

/* DATA COLLECTION */
var xyValues;               // true values used for building plots

var surveyResp = [];        // survey responses
var allTrueValues = [];
var scaledTrueValues = [];
var submittedPoints = [];   // values submitted by the user
var chosenPoints = [];      // values chosen but not submitted by the user
var attemptedSubmissions = [];
var acceptedSubmissions = [];
var allSubmissions = [];
//var attemptedSubmissionsAll = [];
//var acceptedSubmissionsAll = [];
var currentConditionNames = [];
var currentConditionCodes = [];

var chunker = new ChunkWs("wss://somata.inf.ed.ac.uk/chunks/ws",function(a,b,c) {
})

/* PLOT CONTAINER */
var containerDim = 600;     // size of plot container (assumed to be a square)
const margins = 2;          // margins of the container

/* INITIALIZATION */
var finishedConditions = [false, false, false];
var currentCondition = 0;
var expConditions = [];
var expCondition;
var currentMode = "start";  //experimental mode (start | train | test)
const debugmode = true;     // change this for debugging purposes

introduction();

