import sys
sys.path.insert(0, '.')
from send_emails import build_subject, build_email_body, is_already_sent

def test_subject_contains_business_name():
    assert 'Bäckerei Müller' in build_subject('Bäckerei Müller')

def test_body_contains_business_name_and_city():
    body = build_email_body('Metzgerei Huber', 'Mainburg')
    assert 'Metzgerei Huber' in body
    assert 'Mainburg' in body

def test_body_contains_klarvis():
    assert 'Klarvis' in build_email_body('Test GmbH', 'Ingolstadt')

def test_body_contains_sender_name():
    assert 'Nikola' in build_email_body('Test GmbH', 'Ingolstadt')

def test_not_already_sent_with_no_log(tmp_path):
    log = str(tmp_path / 'sent_log.csv')
    assert is_already_sent('abc123', log) is False

def test_already_sent_if_in_log(tmp_path):
    log = tmp_path / 'sent_log.csv'
    log.write_text('place_id,sent_at\nabc123,2026-05-16\n')
    assert is_already_sent('abc123', str(log)) is True
