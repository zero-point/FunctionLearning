const dataURL = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

const margin = {top: 20, right: 30, bottom: 30, left: 40}

const outerWidth = 900;
const outerHeight = 450;

const width = outerWidth - margin.left - margin.right;
const height = outerHeight - margin.top - margin.bottom;

const x = d3.time.scale()
    .range([0, width])
    .nice(d3.time.minute);

const y = d3.scale.linear()
    .range([0, height]);

const xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom')
    .tickFormat(d3.time.format.utc('%Mm %Ss'));

const yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

var chart = d3.select('.chart')
    .append('svg')
      .attr('width', outerWidth)
      .attr('height', outerHeight)
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.json(dataURL, function(error, data) {
  // convert seconds to milliseconds for d3 coercion using JavaScript Date
  data.forEach(d => d.Seconds *= 1000);

  x.domain([new Date(data[0].Seconds), new Date(data[data.length - 1].Seconds)]);
  y.domain([1, d3.max(data, (d) => d.Place)]);

  chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis)
      .append('text')
        // .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', width)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Time');

  chart.append('g')
        .attr('class', 'y axis')
        .call(yAxis)
      .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -25)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .text('Ranking');

  var circles = chart.selectAll('circle')
      .data(data)
        .enter()
    .append('circle')
      .attr('class', d => d.Doping ? 'doping' : 'no-doping')
      .attr('cy', d => y(d.Place))
      .attr('cx', d => x(d.Seconds))
      .attr('r', '4')
      .on('mouseover', function(d) {
        // babel messes up this binding if it's an arrow function
        d3.select('.tooltip')
          .html(
            `<ul><li class="name">${d.Name} (${d.Nationality})</li>
             <li>Year: ${d.Year}</li>
             <li>Time: ${d.Time}</li>
             <li>${d.Doping}</li></ul>`
          )
          .style('opacity', 1)
          .style('top', `${d3.event.pageY - 90}px`)
          .style('left', `${d3.event.pageX + 10}px`)
      })
      .on('mouseout', function(d) {
        d3.select('.tooltip')
          .style('opacity', 0);
      });

  // legend
  let legend = chart.append('g')
      .attr('class', 'legend');

  legend.append('circle')
    .attr('class', 'doping')
    .attr('cy', 20)
    .attr('cx', width - 4)
    .attr('r', '4')
  legend.append('text')
    .attr('y', 22)
    .attr('x', width - 14)
    .style('text-anchor', 'end')
    .text('Riders with doping allegations');

  legend.append('circle')
      .attr('class', 'no-doping')
      .attr('cy', 40)
      .attr('cx', width - 4)
      .attr('r', '4')
  legend.append('text')
    .attr('y', 42)
    .attr('x', width - 14)
    .style('text-anchor', 'end')
    .text('No doping allegations');
});
