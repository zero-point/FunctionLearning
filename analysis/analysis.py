import json
from pprint import pprint
import numpy as np
import pandas as pd
import scipy.stats as stats
import matplotlib.pyplot as plt
import pylab 
import math
import sys

### HELPER FUNCTIONS

# Checking data
def dataCheck(data):
	print(data.keys());
	print(data["expData"]["allTrueValues"][0]);
	print(data["currentConditionNames"]);
	print(data["currentConditionCodes"]);
	print(len(data["expData"]["allSubmittedPoints"]));
	print(len(data["expData"]["allTrueValues"]));

# Survey methods
def surveyGraph(surveyDict):
	fig, axs = plt.subplots(2, 1, sharey=True, figsize=(9,8))    
	d = surveyDict["0"];
	axs[0].bar(range(len(d)), d.values(), align='center')
	axs[0].set_xticks(range(len(d)))
	axs[0].set_xticklabels(surveyAns)
	axs[0].set_title("Q1. I found the website easy to use.")
	d = surveyDict["1"];
	axs[1].bar(range(len(d)), d.values(), align='center')
	axs[1].set_xticks(range(len(d)))
	axs[1].set_xticklabels(surveyAns)
	axs[1].set_title("Q2. The instructions were clear and understandable.")
	plt.show()

def getComments(data):
	if dataPoint["surveyResp"]: 
		print data["surveyResp"][3]["values"];

def mean(numbers):
	return float(sum(numbers)) / max(len(numbers), 1);

def diff(A,B):
	return [abs(x-y) for x, y in zip(A, B)];

############################################################################

### MAIN BODY

# Data reading

if len(sys.argv)>1:
	jsonfile = sys.argv[1];
else:
	jsonfile = "allruns.json";

with open(jsonfile) as data_file:    
	data = json.load(data_file);

### Init

# constructing list of conditions
conditions = ["00","01","02","10","11","12","20","21","22"];

# linear regression features
mapPresCondToFeat1 = {"0": 0,"1": 1,"2": 1}; # isScatter
mapPresCondToFeat2 = {"0": 0,"1": 0,"2": 1}; # hasMemory

# constructing dictionaries 
averages = {};
distances = {};
d = {};
count = 0;
surveyAns = ["Strongly Agree", "Agree", "Neutral", "Disagree", "Strongly Disagree"];
surveyDict = {"0":{"0": 0,"1": 0,"2": 0,"3": 0,"4": 0},"1":{"0": 0,"1": 0,"2": 0,"3": 0,"4": 0}};
surveyDict2 = {"0": 0,"1": 0,"2": 0,"3": 0,"None":0};
for i,dataPoint in enumerate(data):
	if True:
		if True:
#	if dataPoint["surveyResp"]: #and len(response["allSubmittedPoints"])>10:
#		if ((2 in dataPoint["surveyResp"][2]["values"]) == True): 
			condition = ""+''.join(data[i]["currentConditionCodes"][:2]);
			response = dataPoint["expData"];
			count += 1;
	#		print(count);
	#		print(dataPoint["conditionId"]);
	#		print(dataPoint["sessionId"]);
			getComments(dataPoint);
			pred = response["allSubmittedPoints"][40:80];
			true = response["scaledTrueValues"][1][40:80];
			dist = diff(pred,true);
			avg = mean(dist);
			if condition in averages:
				averages[condition].append(avg);	# average differences/error
			else:
				averages[condition] = [avg];	# average differences/error
			presCond = condition[:1];
			temp = {	
				'isScatter' : mapPresCondToFeat1[presCond],
				'hasMemory' : mapPresCondToFeat2[presCond],
				'MAE' :  avg
				};
			if condition[1:2] in d.keys():
				d[condition[1:2]].append(temp);
			else:
				d[condition[1:2]] = [temp];
			if dataPoint["surveyResp"]:
				surveyDict["0"][str(dataPoint["surveyResp"][0]["values"][0])] += 1;
				surveyDict["1"][str(dataPoint["surveyResp"][1]["values"][0])] += 1;
				if dataPoint["surveyResp"][2]["values"]:
					for ans in dataPoint["surveyResp"][2]["values"]:
						surveyDict2[str(ans)] += 1;
				else:
					surveyDict2['None'] += 1;		

print(count);
for i in averages.keys():
	print(i,len(averages[i]));
	#print(d[i][0]['MAE']);
	#print('{}	{}	{}	{}'.format(d[i]['MAE'],i,d[i]['isScatter'],d[i]['hasMemory']));
#surveyGraph(surveyDict); # Q1&Q2
#print(surveyDict2); # Q3

#-------------------------------------------------------------------------------------------------------------------------------------------------------------#

### (1) Are there meaningful performance differences between scatterplot and traditional function learning presentation methods? (9 t-tests)

# Easiest is to compare s+ and b across the three diff function types, as separate independent-samples t-tests. (caveat: multiple-comparisons issues)
# A carefully designed Bayesian linear model would be nice, but as Pablo can attest there are lots of fiddly issues in setting those up and not the best use of time
# If there were time, I'd recommend a Bayesian parameter-estimation approach that builds a single model to make sense of all of the conditions 
print("part 1");

def ttestVarFalse(cat1,cat2):
	return stats.ttest_ind(cat1, cat2, equal_var=False); #
def ttestVarTrue(cat1,cat2):
	return stats.ttest_ind(cat1, cat2, equal_var=True);

def sttest(d1,d2): # Student's t-test
	avg1 = np.mean(d1);
	avg2 = np.mean(d2);
	var1 = np.var(d1);
	var2 = np.var(d2);
	num1 = float(len(d1));
	num2 = float(len(d2));
	df = num1+num2-2;
	result = (avg1-avg2)/np.sqrt((var1**(2.0))/num1+(var2**(2.0))/num2);
	return result,df;

def wttest(d1,d2): # Welch's t-test
	avg1 = np.mean(d1);
	avg2 = np.mean(d2);
	var1 = np.var(d1);
	var2 = np.var(d2);
	num1 = float(len(d1));
	num2 = float(len(d2));
	df = ((var1/num1 + var2/num2)**(2.0))/((var1/num1)**(2.0)/(num1-1)+(var2/num2)**(2.0)/(num2-1)) 
	result = (avg1-avg2)/np.sqrt((var1**(2.0))/num1+(var2**(2.0))/num2);
	return result,df;

def plotPValue(t,df,p):
	fig, ax = plt.subplots()
	x = np.linspace(-abs(t*3/2), abs(t*3/2), 200)
	t_dist = stats.t.pdf(x, df)
	ax.plot(x, t_dist, label='t-distribution')
	ax.vlines(t, 0, 0.4, linestyles='--', color='k', 
			label='t-statistic = {:.3f}'.format(t))
	ax.set_ylabel('pdf(t)')
	ax.set_xlabel('t')
	ax.set_ylim(0, 0.4)
	ax.legend(loc=9)
	ax.fill_between(x, 0, t_dist, where=(x >= t), color='grey', alpha=0.25)
	ax.fill_between(x, 0, t_dist, where=(x < -t), color='grey', alpha=0.25)
	pylab.show()

for cond1 in averages.keys():
	for cond2 in averages.keys():
		if cond1 != cond2:
			stt,sdf = sttest(averages[cond1], averages[cond2]);
			spval = stats.t.sf(np.abs(stt),sdf)*2;
			wtt,wdf = wttest(averages[cond1], averages[cond2]);
			wpval = stats.t.sf(np.abs(wtt),wdf)*2;
			if spval<0.1 or wpval<0.1:
				print("-------------------------------------");
				print(cond1);
				print(cond2);
				print('student: t-statistic = %6.3f pvalue = %6.4f' % (	stt, spval)); # p<0.05 reject H0
				print('welch: t-statistic = %6.3f pvalue = %6.4f' % (wtt, wpval));	
				if stt:	
					if spval:
						a=0;
						#plotPValue(stt,sdf,spval);
				else:
					if wpval:
						a=0;
						#plotPValue(wtt,wdf,wpval);

			#print(ttestVarFalse(averages[cond1][:1],averages[cond2][:1])); # welch
			#print(ttestVarTrue(averages[cond1][:1],averages[cond2][:1])); # student

			# if we think the samples come from populations with unequal variances => set the equal_var=False
			# the results are then from Welch's t-test, which does not assume equal population variance

#-------------------------------------------------------------------------------------------------------------------------------------------------------------#

### (2) If differences are present, can they be attributed to the simultaneous presentation of multiple points and the consequences for memory (or visual gestalt)?

# if "hasMemory" coeff is substantially > than the coeff for "isScatter" => suggests it's about the memory/perception aspect rather than presentation method
# if "isScatter" coeff is > than the coeff for "isScatter" => suggests the performance differences can't be attributed to simultaneous presentation of multiple points

print("part 2")

statLinear = pd.DataFrame(d["0"]);
statQuad = pd.DataFrame(d["1"]);
statPer = pd.DataFrame(d["2"]);
#print("statLinear", statLinear.describe());
#print("statQuad: ",statQuad.describe());
#print("statPer: ",statPer.descrixbe());
#print(np.mean(statLinear["MAE"]),np.mean(statQuad["MAE"]));
#print(np.sqrt(np.var(statLinear["MAE"])),np.var(statQuad["MAE"]));

print(stats.ttest_1samp(statQuad['MAE'], np.mean(statPer['MAE'])));
print(stats.ttest_1samp(statPer['MAE'], np.mean(statLinear['MAE'])));
print(stats.ttest_1samp(statLinear['MAE'], np.mean(statPer['MAE'])));

#plt.boxplot([statLinear['MAE'],statQuad['MAE'],statPer['MAE']],labels=['Linear','Quadratic','Periodic'], showmeans=True);#, notch=True);
#plt.show();

def plotNormalDist(stat,label):
	fig = plt.figure()
	h = stat['MAE'].values.tolist()
	#h = sorted(h) 
	#plt.set_xticks(np.linspace(min(h),max(h),len(h)));
	plt.hist(h,bins=10,normed=True,label="MAE Frequency")
	x = np.linspace(min(h),max(h),len(h))
	y = stats.norm.pdf(x, loc=np.mean(h), scale=np.std(h)) 
	plt.plot(x,y, label="Normal Distribution")
	plt.legend(loc='best')
	plt.show()      

#plotNormalDist(statLinear,'Linear');     
#plotNormalDist(statQuad,'Quadratic');     
#plotNormalDist(statPer,'Periodic');     

def oldplotNormalDist():
	h = sorted(statLinear['MAE'].values.tolist()) 
	x = np.linspace(min(h),max(h),len(h))
	y = stats.norm.pdf(x, loc=np.mean(h), scale=np.std(h))  
	pylab.plot(x,y,label='Linear')

	h = sorted(statQuad['MAE'].values.tolist()) 
	x = np.linspace(min(h),max(h),len(h))
	y = stats.norm.pdf(x, loc=np.mean(h), scale=np.std(h))  
	pylab.plot(x,y,label='Quadratic')

	h = sorted(statPer['MAE'].values.tolist()) 
	x = np.linspace(min(h),max(h),len(h))
	y = stats.norm.pdf(x, loc=np.mean(h), scale=np.std(h))  
	pylab.plot(x,y,label='Periodic')

	plt.legend(loc='best')
	plt.show()      
#oldplotNormalDist();

def getColors(x,y):
	#x = statLinear.loc[:,"isScatter"];
	#y = statLinear.loc[:,"MAE"];
	xy = np.vstack([x,y])
	z = stats.gaussian_kde(xy)(xy)
	idx = z.argsort()
	x, y, z = x[idx], y[idx], z[idx]
	return x,y,z;

def plotFeatGraphsScatter():
	funcNames = ["Linear","Quadratic","Periodic"];
	feat = "isScatter";
	fig, axs = plt.subplots(1, 3, sharey=True)
	for j,func in enumerate([statLinear,statQuad,statPer]):
	#for i,feat in enumerate(["isScatter","hasMemory"]):
		x,y,z = getColors(func.loc[:,feat], func.loc[:,"MAE"]);
		func.plot(kind='scatter', x=feat, y='MAE', c=z, ax=axs[j]) # xticks=[0,1],
		axs[j].set_xticks([0,1])
		axs[j].set_xticklabels(["False","True"])
		axs[j].set_title(funcNames[j])
	plt.show()

def plotFeatGraphsMemory():
	funcNames = ["Linear","Quadratic","Periodic"];
	feat = "hasMemory";
	fig, axs = plt.subplots(1, 3, sharey=True)
	for j,func in enumerate([statLinear,statQuad,statPer]):
		x,y,z = getColors(func.loc[:,feat], func.loc[:,"MAE"]);
		func.plot(kind='scatter', x=feat, y='MAE', c=z, ax=axs[j]) # xticks=[0,1],
		axs[j].set_xticks([0,1])
		axs[j].set_xticklabels(["False","True"])
		axs[j].set_title(funcNames[j])
	plt.show()

#plotFeatGraphsScatter();
#plotFeatGraphsMemory();

import statsmodels.formula.api as smf

def linearRegression(stat):
	lm = smf.ols(formula='MAE ~ isScatter + hasMemory', data=stat).fit()
	coeffs = lm.params;
	print(coeffs);

linearRegression(statLinear);
linearRegression(statQuad);
linearRegression(statPer);

# COMPARE COEFFS (for presentation effect discussion)

#-------------------------------------------------------------------------------------------------------------------------------------------------------------#

### (3) If the answer to (2) is in the affirmative, can we explain participants' inferences in terms of Bayesian inference applied to a limited memory buffer

# A Bayesian account would predict that people will rely more heavily on their a priori assumptions as their memory for the data becomes less reliable. Thus you'd expect that there would be very little difference between s- and s+ errors for the linear function, and the greatest difference would be for the periodic function. However, there are other possible explanations for such an effect. I can think of other analyses, e.g., looking at the predictions of a Bayesian model, but I doubt you'll have time to look at that; perhaps something for the discussion section.

# We might expect that people will do well in all of the linear conditions because linearity is what they expect a priori (but there are alternate explanations for such an effect), and that quadaric will be harder and periodic harder still.

# COMPARE MAE & COEFFS (for function effect discussion)

print("part 3")

#-------------------------------------------------------------------------------------------------------------------------------------------------------------#

# function type effect


	
