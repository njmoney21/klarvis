import argparse
import csv
import os
import smtplib
import time
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = 'smtp-relay.brevo.com'
SMTP_PORT = 587
SMTP_USER = os.getenv('BREVO_SMTP_USER', '')
SMTP_PASS = os.getenv('BREVO_SMTP_PASSWORD', '')
SENDER_EMAIL = os.getenv('SENDER_EMAIL', 'hallo@klarvis.de')
SENDER_NAME = os.getenv('SENDER_NAME', 'Nikola – Klarvis')

_SUBJECT = 'Website für {business_name} — kurze Frage'

_BODY = """\
Hallo,

ich bin auf {business_name} in {city} aufmerksam geworden und wollte kurz nachfragen — haben Sie bereits eine eigene Website?

Ich bin Nikola von Klarvis, einer kleinen Webdesign-Agentur aus der Region. Wir bauen professionelle Websites für lokale Unternehmen in Bayern — schnell, mobilfreundlich und zu einem fairen Preis.

Ein aktuelles Beispiel unserer Arbeit: remcosmetics.de — ein Kosmetikstudio aus Mainburg.

Falls Sie Interesse haben: ich melde mich gerne kurz per Telefon oder schreibe Ihnen ein unverbindliches Angebot.

Viele Grüße,
Nikola
Klarvis · hallo@klarvis.de
"""


def build_subject(business_name: str) -> str:
    return _SUBJECT.format(business_name=business_name)


def build_email_body(business_name: str, city: str) -> str:
    return _BODY.format(business_name=business_name, city=city)


def is_already_sent(place_id: str, log_path: str) -> bool:
    if not os.path.exists(log_path):
        return False
    with open(log_path, newline='', encoding='utf-8') as f:
        return any(row['place_id'] == place_id for row in csv.DictReader(f))


def log_sent(place_id: str, log_path: str) -> None:
    write_header = not os.path.exists(log_path)
    with open(log_path, 'a', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['place_id', 'sent_at'])
        if write_header:
            writer.writeheader()
        writer.writerow({'place_id': place_id, 'sent_at': date.today().isoformat()})


def send_email(to_email: str, subject: str, body: str) -> None:
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f'{SENDER_NAME} <{SENDER_EMAIL}>'
    msg['To'] = to_email
    msg.attach(MIMEText(body, 'plain', 'utf-8'))
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())


def run(input_csv: str, log_path: str, dry_run: bool = False) -> None:
    with open(input_csv, newline='', encoding='utf-8') as f:
        leads = list(csv.DictReader(f))

    sent = skipped = 0
    for lead in leads:
        email = lead.get('email', '').strip()
        if not email:
            print(f'  skip (no email): {lead["business_name"]}')
            skipped += 1
            continue
        if is_already_sent(lead['place_id'], log_path):
            print(f'  skip (already sent): {lead["business_name"]}')
            skipped += 1
            continue

        subject = build_subject(lead['business_name'])
        body = build_email_body(lead['business_name'], lead['city'])

        if dry_run:
            print(f'  DRY RUN — would send to {email}: {subject}')
        else:
            send_email(email, subject, body)
            log_sent(lead['place_id'], log_path)
            print(f'  Sent to {email}: {lead["business_name"]}')
            sent += 1
            time.sleep(1)

    print(f'\nDone. Sent: {sent}, Skipped: {skipped}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='leads.csv')
    parser.add_argument('--log', default='sent_log.csv')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    run(args.input, args.log, args.dry_run)
