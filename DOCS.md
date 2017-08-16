# Documentation

## Versions:
### live version: .\ route
### debug version: .\debug route

App design v3.0: Reduced the experiment to 1 condition per participant (between-groups design), rather than the previous 3. 


## Code structure:
HTML code location: index.html
Javscript code location: js/main.js
CSS code location: css/main.css


## URL parameters
Experiment condition and participant identifier extracted from URL parameters: cid/conditionID and sid/sessionID 
If none are specified in the link, the website will generate a random condition and sessionID (format infomation below at 'In-built elements')
e.g. ?cid=12&sid=322444 or ?conditionID=12&sessionID=322444


## Experiment generated partly from JSON file 
Current experimental data location: exp\_input.json

JSON format:
	version-id: current version of the website
	consentform: introduction to the experiment and consent form displayed on the landing page
	instructions: information for each task (separate entries for training and testing) displayed on a panel on the left of the plot area
	intro-info: information shown in an overlay message before each task (separate entries for training and testing)
	conclusion: message shown at the end of the tasks on the panel to the left of the survey.
	surveyResp: dictionary element with the key being the order of the question and the values being a dictionary element holding the survey information
			type: can be <likert>, <open> or <closed>
			question: question statement
			answers: answer statements (dictionary element with the keys being the order and the values the answers)


## In-built elements (not generated from JSON): 	
	Function options: linear (2\*x+1), quadratic (x\*x), periodic (sin(x))
		- selected based on the second digit of the URL parameter (cid/conditionID): {"0":linear, "1": quadratic, "2": periodic}
		- equations defined in functionDict variable 
	

	Presentation options: scatter plot full memory (showing previous points), scatter no memory (no previous points), bar plot 
		- selected based on the first digit of the URL parameter (cid/conditionID): {"0":bar, "1": scatter-, "2": scatter+}
		- methods defined in presentationDict variable



## Important methods (main.js):

	barPlot(): defines the appearance and behaviour of the bar plot condition

	scatterFullMem(): defines the appearance and behaviour of the scatter+ plot condition

	scatterNoMem(): defines the appearance and behaviour of the scatter- plot condition

	checkStatus(): starts each task, ensuring progression from training to testing in each; goes to survey once total number of conditions has been reached

	getCondition(): parses condition identifier or generates a random one if none was provided

	survey(): generates survey data from JSON, defines the display and behaviour of the survey

	submitPoints(): submits the collected data to the server using web sockets
