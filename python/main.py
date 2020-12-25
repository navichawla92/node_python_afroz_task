import requests
from bs4 import BeautifulSoup
import random
import pandas as pd
from collections import Counter

names="james,john,robert,michael,william,david,richard,charles,joseph,thomas,christopher,daniel,paul,mark,donald,george,kenneth,steven,edward,brian,ronald,anthony,kevin,jason,matthew,gary,timothy,jose,larry,jeffrey,frank,scott,eric,stephen,andrew,raymond,gregory,joshua,jerry,dennis,walter,patrick,peter,harold,douglas,henry,carl,arthur,ryan,roger,joe,juan,jack,albert,jonathan,justin,terry,gerald,keith,samuel,willie,ralph,lawrence,nicholas"


list_of_names = names.split(',')
A = ("Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36",
       "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36",
    )

Agent = A[random.randrange(len(A))]

results = []
origins_list = []

for name in list_of_names:

    # get Google search count
    url = 'https://google.com/search?q=' + name
    headers = {'user-agent': Agent}
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'lxml')
    for info in soup.find_all('div', id="result-stats"):
        text = info.text.split(' ')
        print(name + ' has ' + text[1] + ' results')
        results.append({
            'name': name,
            'count': text[1]
        })

    # get origin
    names_url = 'https://www.names.org/n/' + name +'/about'
    r = requests.get(names_url, headers=headers)
    soup = BeautifulSoup(r.text, 'lxml')
    origin_div = soup.find_all('div', id="name-box-right")
    for ul in origin_div:
        get_ul = ul.find('ul')
        get_li = get_ul.find_all("li")[0]
        origin = get_li.text.split(':')[1].strip()
        print(name + ' is from ' + origin + ' origin')
        origins_list.append({
          'name': name,
          'origin': origin
        })

# create csv for google results
df = pd.DataFrame().from_dict(results)
df.sort_values(by=['count'], axis=0, ascending=True, inplace=True)
df.to_csv('google_result.csv')

# get Occourance
occour = Counter([item.get('origin') for item in origins_list])

for item in origins_list:
    item.update({
      'occurrence': occour.get(item.get('origin'))
    })

# create csv for origin and occourance
origin_df = pd.DataFrame().from_dict(origins_list)
origin_df.sort_values(by=['occurrence'], axis=0, ascending=True, inplace=True)
origin_df.to_csv('origin.csv')