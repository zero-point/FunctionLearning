const debug_mode = false;
var submittedPoints = [];
var judgementCount;

if (debug_mode) {
  judgementCount = 30;
}
else {
  judgementCount = 1;
}

var data2 = [{index: 1, value: 0.15},];

var positions = Array.apply(null, {length: 41}).map(Number.call, Number);
var dataX = positions.map(function(x) { return x+1; });
var dataY = positions.map(function(x) { return 2*x+1; });


function updateData(newHeight,train=false){                                           // RENEW DATA
var selection_made = false;
//--------------- HORIZONTAL BAR CHART--------------------
var widthX = 450,
  heightX = 100,
  delim = 4;
var scaleX = d3.scaleLinear()
  .domain([0, 41.4])
  .rangeRound([0, widthX]);
var y = d3.scaleLinear()
  .domain([0, data2.length])
  .rangeRound([0, heightX]);
var svgX = d3.select('#horiz')
.append("svg")
  .attr("width", widthX)
  .attr("height", heightX)
  .attr("style", "outline: 2px solid black;")
.append('g');
svgX
.append('rect')
  .attr('x', 0)
  .attr('y', 0)
  .style('stroke', '#eee')
  .style('fill', '#eee')
  .attr('width', widthY)
  .attr('height', heightY);

var blueXRect = svgX.append("rect")
  .attr('x', 2)
  .attr('y', 2)
  .style('stroke', 'steelblue')
  .style('fill', 'steelblue')
  .attr("width", scaleX(dataX[judgementCount]))
  .attr("height", 96);

//--------------- VERTICAL BAR CHART--------------------
var widthY = 100,
  heightY = 450;
var coord;
var scaleY = d3.scaleLinear()
  .domain([0, 42])
  .rangeRound([heightY, 0]);
var x = d3.scaleLinear()
  .domain([0, data2.length])
  .rangeRound([0, widthY]);
var svgY = d3.select('#vert')
.append("svg")
  .attr("width", widthY)
  .attr("height", heightY)
  .attr("style", "outline: 2px solid black;")
.append('g')
.on("mousemove", mousemoved)
.on("click", clicked);
svgY
.append('rect')
  .attr("id", "rectangle")
  .attr('x', 0)
  .attr('y', 0)
  .style('stroke', '#eee')
  .style('fill', '#eee')
  .attr('width', widthY)
  .attr('height', heightY);

if(newHeight!=undefined){
data2 = [ {index: 1, value: newHeight},
];
}
else{
data2 = [ {index: 1, value: 0.15},
];
}

if (debug_mode) {
selection_made = true;
}


function mousemoved(d){
coord = d3.mouse(this);
};

var close = false;
function clicked(d){
if (d3.event.defaultPrevented) return; // dragged
//  d3.select(this).on('mousedown.drag', null);
var coordinates = d3.mouse(this);
//console.log("Coordinates: " + coordinates);
if(coordinates[1]>=2){
  var newHeight = coordinates[1];
  svgY.select("#temp_red").remove();
  svgY.select("#temp_blue").remove();
  blueRect(scaleY.invert(newHeight));
  console.log(Math.abs(scaleY(dataY[judgementCount])-newHeight));
  if (Math.abs(scaleY(dataY[judgementCount])-newHeight)<50) {
    close = true;
  }
  selection_made = true;

  document.onkeyup = function(e) {
    var key = e.keyCode || e.which;
    if (key === 32 && selection_made ) {
      console.log("user hit space");
      submittedPoints.push(newHeight);
      if (scaleY(dataY[judgementCount])<newHeight) {
        svgY.select("#temp_blue").remove();
        redRect();
        blueRect(scaleY.invert(newHeight));
      }
      else {
        svgY.select("#temp_blue").remove();
        blueRect(scaleY.invert(newHeight));
        redRect();
      }
    }

    if (key === 13 && selection_made && close) {
      console.log("user hit enter");
      if(judgementCount!=40){
        judgementCount += 1;
        document.getElementById('judgementCount').innerHTML = "Judgment "+judgementCount+" out of 40";
        //submitPoint(newHeight); // and all the rest, also should be JSON
        d3.select("svg").remove();
        d3.select("#vert").selectAll("svg").remove();
        updateData(undefined);
      }
      else {
        svgY.on("click", function(d){});
        document.querySelector(".nextScenarioButton").style="display:inline"; // NextButton to quadratic
      }
      //  localStorage.setItem('JSON_output', JSON.stringify(obj));
    }
  }
}
};

function redRect(){
svgY.append("rect")
.attr('id',"temp_red")
  .attr('x', 2)
  .attr('y', scaleY(dataY[judgementCount]))
  .style('stroke', 'red')
  .style('fill', 'red')
  .attr("width", 96)
  .attr("height", 448-scaleY(dataY[judgementCount]));
}
function blueRect(yValue){
svgY.append("rect")
  .attr('id',"temp_blue")
  .attr('x', 2)
  .attr('y', scaleY(yValue))
  .style('stroke', 'steelblue')
  .style('fill', 'steelblue')
  .attr("width", 96)
  .attr("height", 448-scaleY(yValue));
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
        this.wso.send(dataStr);
        self.doneState = 1;
  }


}

ChunkWs.prototype = {
  constructor: ChunkWs
}

}

updateData(undefined);

function submitPoint(){
  var flWebSocket = new WebSocket("ws://somata.inf.ed.ac.uk/fl/ws");
  flWebSocket.onopen = function() {
    /*Send a small message to the console once the connection is established */
    console.log('Connection open!');
  }

  flWebSocket.onmessage = function(event) {
    message = JSON.parse(event.data);
    console.log('webSocket message: ' + message);
  }

 flWebSocket.onerror = function(error){
   console.log('webSocket error detected: ' + error);
 }

 //judgementCount
 var JSON_output = {"version-id": "1.0","sessionID": "","clientTime":"","condition":"1","trainX":dataX,"trainY":submittedPoints,"judgements": submittedPoints};
 JSON_output.clientTime = Date.now();
 JSON_output.sessionID = randomString(16);

 flWebSocket.send(JSON.stringify(JSON_output));

}
//submitPoint();


//   var JSON_output = {"version-id": "1.0","sessionID": "","clientTime":"","condition":"1","trainX":dataX,"trainY":submittedPoints,"judgements": submittedPoints};
//   JSON_output.clientTime = Date.now();
// //  JSON_output.sessionID = randomString(16);
//   console.log(JSON_output);
