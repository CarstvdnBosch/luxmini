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
check "Homepage drieluik"     200 "$BASIS/"                  'id="producten"'
check "Werkwijze"             200 "$BASIS/werkwijze"         "Werkwijze</h1>"
check "Kraamcadeauboxen"      200 "$BASIS/kraamcadeauboxen"  "Kies je formaat"
check "Prematuurkleding"      200 "$BASIS/prematuurkleding"  "Prematuurkleding</h1>"
check "Babynest"              200 "$BASIS/babynest"          "Babynest</h1>"
check "Inspiratie"            200 "$BASIS/inspiratie"        "Inspiratie</h1>"
check "Privacy"               200 "$BASIS/privacy"           "Privacyverklaring"
check "Contact"               200 "$BASIS/contact"           "Contact</h1>"
check "Contactformulier"      200 "$BASIS/contact"           'action="/api/contact"'
check "Afbeelding"            200 "$BASIS/assets/img/hero-box-open.jpg"
check "Oud adres producten"   301 "$BASIS/producten"
check "Oud adres over"        301 "$BASIS/over"
check "Oud adres kraamcadeaubox" 301 "$BASIS/kraamcadeaubox"
check "Oud Wix-adres"         301 "$BASIS/aanbod"
check "Oud adres portfolio"   301 "$BASIS/portfolio"
check "Oud adres klantenservice" 301 "$BASIS/klantenservice"
check "Onbekende pagina"      404 "$BASIS/bestaat-niet"
check "Formulier (GET)"       303 "$BASIS/api/contact"

# Formulier (POST): zoals een echte browser het verstuurt (navigatie) en zoals fetch het doet.
# Bewust ZONDER verplichte velden (alleen een onderwerp): de Worker weigert het en stuurt nooit een mail.
# Verwacht 303 naar /contact?verzonden=fout#formulier; 405 betekent dat de assets-laag het verzoek
# afhandelt en de Worker niet draait (run_worker_first in wrangler.jsonc).
post_check() { # omschrijving, extra curl-argumenten...
  local wat="$1"; shift
  local uit status locatie
  uit=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" --data "onderwerp=rooktest" "$@" \
    "$BASIS/api/contact")
  status="${uit%% *}"; locatie="${uit#* }"
  if [ "$status" != "303" ]; then
    echo "x $wat: status $status (verwacht 303)"; fout=1; return
  fi
  case "$locatie" in
    */contact\?verzonden=fout\#formulier) echo "✓ $wat" ;;
    *) echo "x $wat: Location '$locatie' (verwacht /contact?verzonden=fout#formulier)"; fout=1 ;;
  esac
}
post_check "Formulier (POST, browser-navigatie)" \
  -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" -H "Sec-Fetch-Site: same-origin" \
  -H "Sec-Fetch-User: ?1" -H "Accept: text/html,application/xhtml+xml" -H "Origin: $BASIS" -H "Referer: $BASIS/contact"
post_check "Formulier (POST, fetch)" \
  -H "Sec-Fetch-Mode: cors" -H "Sec-Fetch-Dest: empty" -H "Accept: */*"

# Beheer (brief 2026-11-07-beheer-administratie, R15c): zonder inlog nooit 200.
# Verwacht 403 van de Worker, of een doorverwijzing naar de inlog van Cloudflare Access (*.cloudflareaccess.com).
# Een 301/302 naar hetzelfde pad op https://luxmini.nl (www → hoofddomein) wordt één keer gevolgd;
# daarna moet er alsnog 403 of de inlog van Access komen.
beheer_check() { # omschrijving, pad
  local wat="$1" pad="$2" url="$BASIS$2" uit status locatie via=""
  uit=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$url")
  status="${uit%% *}"; locatie="${uit#* }"
  case "$status" in
    301|302)
      if [ "$locatie" = "https://luxmini.nl$pad" ] && [ "$url" != "$locatie" ]; then
        via=" via luxmini.nl"; url="$locatie"
        uit=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$url")
        status="${uit%% *}"; locatie="${uit#* }"
      fi ;;
  esac
  if [ "$status" = "403" ]; then echo "✓ $wat (403$via)"; return; fi
  case "$status" in
    301|302|303|307|308)
      case "$locatie" in
        https://*.cloudflareaccess.com/*) echo "✓ $wat (naar de inlog van Access$via)"; return ;;
      esac ;;
  esac
  echo "x $wat: status $status ${locatie:+naar $locatie }(verwacht 403 of de inlog van Access)$via"; fout=1
}
beheer_check "Beheer zonder inlog"        /beheer
beheer_check "Beheer-API zonder inlog"    /api/beheer/boekingen

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
