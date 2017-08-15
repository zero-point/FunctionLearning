import json
from pprint import pprint

with open('test-flo.json') as data_file:    
    data = json.load(data_file)

#pprint(data)

### helper functions
def mean(numbers):
    return float(sum(numbers)) / max(len(numbers), 1);

def diff(A,B):
    return [abs(x-y) for x, y in zip(A, B)];
### init

condTrue = data["trueValues"][40:80];
condPred = data["submittedPoints"][40:80];

# mean error calculation for 1 treatment

diff = diff(condTrue,condPred);
print(diff);

avg = mean(diff);
print(avg);


