import json
from urllib.request import urlopen

menu = json.load(urlopen('http://localhost:8000/api/menus/'))
branches = json.load(urlopen('http://localhost:8000/api/branches/'))
branch = branches['results'][0]
print(f"menu_categories={len(menu)} menu_items={sum(len(c['items']) for c in menu)}")
print(f"branches={branches['count']} sample_branch={branch['slug']}")
availability = json.load(urlopen(
    f"http://localhost:8000/api/reservations/availability/?branch={branch['slug']}&date=2026-10-12&guests=4"
))
print(f"slots={len(availability['slots'])} first={availability['slots'][0] if availability['slots'] else None}")
