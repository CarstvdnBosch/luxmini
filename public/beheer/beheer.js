// LUX mini — beheer (luxmini.nl/beheer). Eigen script; main.js wordt hier niet geladen (O1).
// S1: tabs Boekingen · Overzicht · Exporteren en de ingelogde (GET /api/beheer/ik).
(function () {
  'use strict';

  // ---------- Tabs (WAI-ARIA: pijltjes, Home en End; aria-selected; O4, O22) ----------
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function kies(tab, focus, adresBijwerken) {
    tabs.forEach(function (t) {
      var actief = t === tab;
      t.setAttribute('aria-selected', actief ? 'true' : 'false');
      t.tabIndex = actief ? 0 : -1;
      var paneel = document.getElementById(t.getAttribute('aria-controls'));
      if (paneel) paneel.hidden = !actief;
    });
    if (focus) tab.focus();
    if (adresBijwerken && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + tab.id.replace(/^tab-/, ''));
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { kies(tab, false, true); });
    tab.addEventListener('keydown', function (e) {
      var doel = null;
      if (e.key === 'ArrowRight') doel = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') doel = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') doel = tabs[0];
      else if (e.key === 'End') doel = tabs[tabs.length - 1];
      if (doel) { e.preventDefault(); kies(doel, true, true); }
    });
  });

  // een adres met #overzicht of #exporteren opent die tab (ook als alleen het #-deel verandert)
  function tabUitAdres() {
    var tab = document.getElementById('tab-' + (location.hash || '').slice(1));
    if (tab && tabs.indexOf(tab) >= 0) kies(tab, false, false);
  }
  tabUitAdres();
  window.addEventListener('hashchange', tabUitAdres);

  // ---------- Wie is ingelogd ----------
  var melding = document.getElementById('melding');
  function toonMelding(tekst) { melding.textContent = tekst; melding.hidden = false; }

  fetch('/api/beheer/ik', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error(String(res.status));
      return res.json();
    })
    .then(function (ik) {
      document.getElementById('wie-adres').textContent = ik.email || '';
      document.getElementById('wie').hidden = !ik.email;
      document.documentElement.setAttribute('data-rol', ik.rol);
      document.getElementById('meekijken').hidden = ik.rol !== 'lezen';
    })
    .catch(function () {
      toonMelding('Je gegevens konden niet worden geladen. Ververs de pagina of log opnieuw in.');
    });
})();
