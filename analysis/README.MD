### Data analysis script for function learning experiment (v3.0)

# @author: Irina Preda (s1143039@sms.ed.ac.uk)
# @date: 07.08.17

# script name: analysis.py
# experimental data: allruns.json


## Commands: 

Running standard script: 		python analysis.py 
(default file: allruns.json)

Running script on other JSON data: 	python analysis.py jsonfile 

## Description

The script reads the experimental data (expected to be in JSON file format) and parses it to collect the information regarding participant information (sessionID, conditionID, etc), true versus predicted points, survey data, etc.

The following analysis is implemented:

- t-Tests (pairing all 9 independent conditions): returning the t-statistic and p-value
- Linear regression: returning the coefficient values
