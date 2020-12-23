import requests
from bs4 import BeautifulSoup
import random
import time
import pandas as pd

names="james,john,robert,michael,william,david,richard,charles,joseph,thomas,christopher,daniel,paul,mark,donald,george,kenneth,steven,edward,brian,ronald,anthony,kevin,jason,matthew,gary,timothy,jose,larry,jeffrey,frank,scott,eric,stephen,andrew,raymond,gregory,joshua,jerry,dennis,walter,patrick,peter,harold,douglas,henry,carl,arthur,ryan,roger,joe,juan,jack,albert,jonathan,justin,terry,gerald,keith,samuel,willie,ralph,lawrence,nicholas"

list_of_names = names.split(',')
A = ("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
       "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
    )

Agent = A[random.randrange(len(A))]
df = pd.DataFrame()

results = []
for name in list_of_names:
    url = 'https://google.com/search?q=' + name
    headers = {'user-agent': Agent}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'lxml')
    time.sleep(1)
    for info in soup.find_all('div', id="result-stats"):
        text = info.text.split(' ')
        print(name + ' has ' + text[1] + ' results')
        results.append(text[1])

df['names']=list_of_names
df['counts']=results
df.sort_values(by=['counts'], axis=0, ascending=True, inplace=True)
df.to_csv('output.csv')