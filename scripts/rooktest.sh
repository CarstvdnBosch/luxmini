#!/usr/bin/env bash
# Rooktest na live zetten: bereikbaar, juiste inhoud, doorverwijzingen en formulier-endpoint werken.
# Gebruik: bash scripts/rooktest.sh https://www.luxmini.nl
set -u
BASIS="${1:-}"
if [ -z "$BASIS" ]; then
  echo "Geen SITE_URL ingesteld; rooktest overgeslagen."
  exit 0
fi
BASIS="${BASIS%/}"
fout=0

check() { # omschrijving, verwachte status, url, [tekst die erin moet staan]
  local wat="$1" verwacht="$2" url="$3" tekst="${4:-}"
  local body status
  body=$(curl -s -o /tmp/rook.html -w "%{http_code}" "$url"); status="$body"
  if [ "$status" != "$verwacht" ]; then
    echo "x $wat: status $status (verwacht $verwacht) — $url"; fout=1; return
  fi
  if [ -n "$tekst" ] && ! grep -q "$tekst" /tmp/rook.html; then
    echo "x $wat: tekst '$tekst' niet gevonden — $url"; fout=1; return
  fi
  echo "✓ $wat"
}

for poging in 1 2 3; do  # even geduld na het uitrollen
  curl -s -o /dev/null -w "%{http_code}" "$BASIS/" | grep -q 200 && break
  sleep 10
done

check "Homepage"              200 "$BASIS/"                  "Samen"
check "Kraamcadeaubox"        200 "$BASIS/kraamcadeaubox"    "Kies je formaat"
check "Privacy"               200 "$BASIS/privacy"           "Privacyverklaring"
check "Afbeelding"            200 "$BASIS/assets/img/hero-box-open.jpg"
check "Oud Wix-adres"         301 "$BASIS/aanbod"
check "Onbekende pagina"      404 "$BASIS/bestaat-niet"
check "Formulier (GET)"       303 "$BASIS/api/contact"

# CSS en JS: geen lange cache zonder hercontrole (anders blijft na een release de oude versie staan)
for pad in /assets/css/style.css /assets/js/main.js; do
  cc=$(curl -sI "$BASIS$pad" | tr -d '\r' | grep -i '^cache-control:' | cut -d: -f2- | tr 'A-Z' 'a-z')
  leeftijd=$(printf '%s' "$cc" | grep -o 'max-age=[0-9]*' | cut -d= -f2)
  if [ -n "$leeftijd" ] && [ "$leeftijd" -gt 0 ] && ! printf '%s' "$cc" | grep -q -e must-revalidate -e no-cache; then
    echo "x Cache $pad: '$cc' cachet lang zonder hercontrole"; fout=1
  else
    echo "✓ Cache $pad ($cc)"
  fi
done

if [ "$fout" -ne 0 ]; then
  echo "Rooktest MISLUKT. Terugdraaien: Cloudflare-dashboard → Workers & Pages → luxmini → Deployments → vorige versie → Rollback."
  exit 1
fi
echo "Rooktest geslaagd."
