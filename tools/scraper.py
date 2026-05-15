import argparse
import csv
import os
import time

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('GOOGLE_PLACES_API_KEY')
PLACES_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json'
DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json'

MAINBURG_LAT = 48.6333
MAINBURG_LNG = 11.7833

CATEGORIES = [
    'Friseur', 'Bäckerei', 'Metzgerei', 'Zahnarzt', 'Arzt',
    'Physiotherapie', 'Kosmetik', 'Reinigung', 'Autowerkstatt',
    'Blumenladen', 'Optiker', 'Steuerberater', 'Rechtsanwalt',
    'Restaurant', 'Café', 'Hotel', 'Zimmerei', 'Elektriker', 'Klempner',
]


def is_modern_website(html: str) -> bool:
    soup = BeautifulSoup(html, 'html.parser')
    return soup.find('meta', attrs={'name': 'viewport'}) is not None


def build_lead_row(place: dict, website: str | None, notes: str = '') -> dict:
    return {
        'place_id': place.get('place_id', ''),
        'business_name': place.get('name', ''),
        'category': place.get('_category', ''),
        'city': place.get('vicinity', ''),
        'phone': place.get('formatted_phone_number', ''),
        'email': '',
        'website': website or '',
        'notes': notes or ('keine Website' if not website else ''),
    }


def fetch_places(query: str, radius_m: int) -> list[dict]:
    params = {'query': query, 'location': f'{MAINBURG_LAT},{MAINBURG_LNG}', 'radius': radius_m, 'key': API_KEY, 'language': 'de'}
    results = []
    while True:
        r = requests.get(PLACES_URL, params=params, timeout=10)
        data = r.json()
        results.extend(data.get('results', []))
        next_token = data.get('next_page_token')
        if not next_token:
            break
        time.sleep(2)
        params = {'pagetoken': next_token, 'key': API_KEY}
    return results


def get_place_details(place_id: str) -> dict:
    params = {'place_id': place_id, 'fields': 'website,formatted_phone_number', 'key': API_KEY, 'language': 'de'}
    r = requests.get(DETAILS_URL, params=params, timeout=10)
    return r.json().get('result', {})


def check_website(url: str) -> str:
    try:
        r = requests.get(url, timeout=8, headers={'User-Agent': 'Mozilla/5.0'})
        return 'modern' if is_modern_website(r.text) else 'veraltete Website'
    except Exception:
        return 'Website nicht erreichbar'


def scrape(radius_km: int, output: str) -> None:
    radius_m = radius_km * 1000
    seen_ids: set[str] = set()
    leads: list[dict] = []

    for category in CATEGORIES:
        print(f'Searching: {category}')
        for place in fetch_places(f'{category} Bayern', radius_m):
            pid = place.get('place_id', '')
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            place['_category'] = category

            details = get_place_details(pid)
            website = details.get('website')
            place['formatted_phone_number'] = details.get('formatted_phone_number', '')

            if not website:
                leads.append(build_lead_row(place, website=None))
                print(f'  LEAD (no website): {place["name"]}')
            else:
                status = check_website(website)
                if status != 'modern':
                    leads.append(build_lead_row(place, website=website, notes=status))
                    print(f'  LEAD ({status}): {place["name"]}')
                else:
                    print(f'  skip (modern): {place["name"]}')
            time.sleep(0.1)

    fieldnames = ['place_id', 'business_name', 'category', 'city', 'phone', 'email', 'website', 'notes']
    with open(output, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(leads)
    print(f'\nDone. {len(leads)} leads saved to {output}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--radius', type=int, default=25)
    parser.add_argument('--output', default='leads.csv')
    args = parser.parse_args()
    scrape(args.radius, args.output)
