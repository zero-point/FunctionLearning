import plotly.plotly as py
import plotly.graph_objs as go
#from plotly.tools import FigureFactory as FF

import numpy as np
import pandas as pd
import scipy.stats as stats

data1 = np.random.normal(0, 1, size=50)
data2 = np.random.normal(2, 1, size=50)

x = np.linspace(-4, 4, 160)
y1 = stats.norm.pdf(x)
y2 = stats.norm.pdf(x, loc=2)

trace1 = go.Scatter(
    x = x,
    y = y1,
    mode = 'lines+markers',
    name='Mean of 0'
)

trace2 = go.Scatter(
    x = x,
    y = y2,
    mode = 'lines+markers',
    name='Mean of 2'
)

data1 = [trace1, trace2]
data2 = [trace1, trace2]

twosample_results = stats.ttest_ind(data1, data2)

#matrix_twosample = [['', 'Test Statistic', 'p-value'],['Sample Data', twosample_results[0], twosample_results[1]]]

#twosample_table = FF.create_table(matrix_twosample, index=True)
py.plot(twosample_results, filename='twosample-table')


