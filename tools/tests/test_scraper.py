import sys
sys.path.insert(0, '.')
from scraper import is_modern_website, build_lead_row

def test_no_viewport_is_not_modern():
    html = '<html><head></head><body>Hello</body></html>'
    assert is_modern_website(html) is False

def test_viewport_meta_is_modern():
    html = '<html><head><meta name="viewport" content="width=device-width"></head><body></body></html>'
    assert is_modern_website(html) is True

def test_build_lead_row_no_website():
    place = {'place_id': 'abc123', 'name': 'Bäckerei Müller', 'vicinity': 'Mainburg', 'formatted_phone_number': '+49 8751 1234'}
    row = build_lead_row(place, website=None)
    assert row['business_name'] == 'Bäckerei Müller'
    assert row['website'] == ''
    assert row['notes'] == 'keine Website'

def test_build_lead_row_old_website():
    place = {'place_id': 'def456', 'name': 'Metzgerei Huber', 'vicinity': 'Ingolstadt', 'formatted_phone_number': '+49 841 5678'}
    row = build_lead_row(place, website='http://metzgerei-huber.de', notes='veraltete Website')
    assert row['notes'] == 'veraltete Website'
