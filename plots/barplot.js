var BarChart = rd3.BarChart;

var barData = [
  {label: 'A', value: 5},
  {label: 'B', value: 6},
  {label: 'F', value: 7}
];

var Hello = React.createClass({
    render: function() {
        return <BarChart
                  data={barData}
                  width={500}
                  height={200}
                  fill={'#3182bd'}
                  title='Bar Chart'
                />;
    }
});
 
React.render(<Hello name="World" />, document.body);
