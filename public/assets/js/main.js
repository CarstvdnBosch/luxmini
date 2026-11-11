/* LUX mini — interactie naar het voorbeeld van stockdutchdesign.com.
   Alles werkt ook zonder JavaScript (dan is alle inhoud gewoon zichtbaar) en
   bij "minder beweging" (prefers-reduced-motion) staat alle animatie uit. */
(function () {
  'use strict';
  window.luxKlaar = true; // het nood-script in <head> laat de .js-klasse dan staan
  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muis = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement;
  // Mobiele hero (brief 2026-11-07-homepage-mobiel-stock): t/m 760 px en telefoons liggend (touch, hoogte t/m 500 px).
  // Zelfde voorwaarde als in style.css ("Hero op mobiel"): drie foto's onder elkaar met de kop eronder, geen meebewegen.
  var mobielHero = window.matchMedia('(max-width: 760px), (hover: none) and (pointer: coarse) and (max-height: 500px)');
  var opslag = {
    lees: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    zet: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* niet erg */ } }
  };
  var heroEl = document.querySelector('.hero');
  // De vaste balk verschijnt na de hero (homepage) of na de eerste sectie van een subpagina
  var kopEl = heroEl || document.querySelector('main > .pagina-kop, main > .over-kop, main > .contact-kop');

  /* Kleurhulpjes (naar stockdutchdesign.com): de bovenkant van de pagina
     (.hero-kleur) en één vaste achtergrondlaag voor de rest */
  var heroKleurEls = Array.prototype.slice.call(document.querySelectorAll('.hero-kleur'));
  // Kleurregel: wit staat alleen op terracotta. Elke andere paletkleur zet
  // html.hero-licht, waarmee CSS alle tekst in de bovenkant inkt maakt en
  // het donkere logo toont. Leeg ('') = terug naar terracotta.
  var heroLicht = false, heroKleurNu = '';
  function zetHeroKleur(kleur) {
    kleur = (kleur || '').trim();
    if (kleur.toLowerCase() === '#bc8565') kleur = '';
    heroKleurNu = kleur;
    heroKleurEls.forEach(function (el) { el.style.backgroundColor = kleur; });
    heroLicht = !!kleur;
    html.classList.toggle('hero-licht', heroLicht);
    if (typeof balkBijwerken === 'function') balkBijwerken(true);
  }
  var laag = document.createElement('div');
  laag.className = 'achtergrond';
  laag.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(laag, document.body.firstChild);
  var laagKleur = '';
  function zetLaag(kleur) {
    if (kleur && kleur !== laagKleur) {
      laagKleur = kleur; laag.style.backgroundColor = kleur;
      if (typeof balkBijwerken === 'function') balkBijwerken(); // de balk kleurt mee
    }
  }
  var balkBijwerken = null;
  // Niet-dringende onderdelen starten elk in een eigen taak na de eerste weergave,
  // zodat het laden geen lange blokkerende taak wordt (Lighthouse TBT).
  var later = function (fn) { setTimeout(fn, 0); };
  // Foto's van hero-set B ("Het cadeau") pas na het laden ophalen: ze zijn eerst onzichtbaar.
  // Alleen voor tegels die te zien zijn (op mobiel zijn t1, t3 en t6 verborgen); draait het scherm, dan komen de rest erbij.
  var setBGevraagd = false;
  var laadSetB = function () {
    setBGevraagd = true;
    document.querySelectorAll('img.set-b[data-src]').forEach(function (img) {
      var tegel = img.closest('.tegel');
      if (tegel && getComputedStyle(tegel).display === 'none') return;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    });
  };
  if (document.readyState === 'complete') later(laadSetB); else window.addEventListener('load', function () { later(laadSetB); });
  var bijWissel = function (mq, fn) { if (mq.addEventListener) mq.addEventListener('change', fn); else if (mq.addListener) mq.addListener(fn); };
  bijWissel(mobielHero, function () { if (setBGevraagd) laadSetB(); });
  ['pointerover', 'focusin', 'touchstart'].forEach(function (s) { document.addEventListener(s, function h(e) { if (e.target.closest && e.target.closest('.hero')) { laadSetB(); document.removeEventListener(s, h); } }, { passive: true }); });

  /* ---------------------------------------------------------------
     1. Intro-scherm en pagina-overgang
     --------------------------------------------------------------- */
  var intro = document.querySelector('.intro-scherm');
  var overgang = document.querySelector('.overgang');
  // lux-overgang bewaart de kleur van het vlak tussen twee pagina's ('0' = geen overgang)
  var OVERGANG_KLEUREN = ['#DEB799', '#C89F67', '#C3CFBC', '#B5969E', '#B4B19A', '#BC8565'];
  var vanOvergang = /^#[0-9a-f]{6}$/i.test(opslag.lees('lux-overgang') || '');
  opslag.zet('lux-overgang', '0');

  function heroKlaar() { if (heroEl) heroEl.classList.add('klaar'); document.dispatchEvent(new Event('lux:klaar')); }

  // Het script in <head> heeft al besloten of de intro komt (.intro-aan) en
  // de tijdlijn loopt in CSS (ca. 2,2 s, wens Carst 6 nov.). Hier: hero-kop op ~1,55 s, klaar op ~2,2 s,
  // overslaan met tik, klik, toets, scroll of vegen (dan klaar in 0,6 s).
  if (intro && html.classList.contains('intro-aan') && !stil) {
    (function () {
      var doek = intro.querySelector('.intro-doek');
      var figuur = intro.querySelector('.intro-figuur');
      var foto = intro.querySelector('.intro-foto');
      // de foto pas nu laden: zonder intro (herhaald bezoek, minder beweging, geen JS) wordt hij nooit opgehaald
      if (foto && foto.dataset.src && !foto.getAttribute('src')) foto.src = foto.dataset.src;
      var bewegers = [document.querySelector('.site-header'), document.querySelector('main')].filter(Boolean);
      var verstreken = 0;
      try {
        var an = doek && doek.getAnimations ? doek.getAnimations()[0] : null;
        if (an && an.currentTime !== null) verstreken = Math.max(0, an.currentTime);
      } catch (e) { /* oude browser: tel vanaf nu */ }
      var klaar = false, snel = false, timers = [];
      var na = function (ms, fn) { timers.push(setTimeout(fn, Math.max(0, ms - verstreken))); };
      var opruimen = function () {
        if (klaar) return;
        klaar = true;
        timers.forEach(clearTimeout);
        signalen.forEach(function (s) { window.removeEventListener(s, overslaan, true); });
        html.classList.remove('intro-aan');
        intro.classList.remove('snel');
        bewegers.forEach(function (el) { el.style.transform = ''; el.style.transition = ''; el.style.animation = ''; });
        heroKlaar();
      };
      var overslaan = function () {
        if (klaar || snel) return;
        snel = true;
        // header en pagina vanaf hun huidige plek in 0,5 s naar 0 (binnen 0,6 s klaar)
        bewegers.forEach(function (el) {
          var nu = getComputedStyle(el).transform;
          el.style.animation = 'none';
          el.style.transform = nu === 'none' ? '' : nu;
        });
        void intro.offsetWidth;
        bewegers.forEach(function (el) { el.style.transition = 'transform .45s cubic-bezier(.33,1,.68,1)'; el.style.transform = 'none'; });
        intro.classList.add('snel');
        heroKlaar();
        timers.push(setTimeout(opruimen, 460)); // de uitgang duurt 0,45 s; zo ruim binnen 0,6 s klaar, ook als de browser het druk heeft (ronde 8)
      };
      var signalen = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
      signalen.forEach(function (s) { window.addEventListener(s, overslaan, { capture: true, passive: true }); });
      na(300, function () { if (foto && !(foto.complete && foto.naturalWidth > 0) && figuur) figuur.classList.add('zonder-foto'); });
      na(1550, heroKlaar);           // woorden van de hero-kop komen op
      na(2200, opruimen);            // de intro is klaar
    })();
  } else {
    html.classList.remove('intro-aan');
    // Binnen: het vlak staat dicht (script in <head>) en schuift in 1 s verder naar beneden weg; de pagina komt
    // van -150 px naar 0. Start op DOMContentLoaded; een klik of toets maakt het direct af.
    if (vanOvergang && overgang && !stil && html.classList.contains('overgang-binnen')) {
      // Komt de bezoeker op een anker (kraamcadeauboxen.html#themas), dan springt de browser ernaar terwijl de pagina
      // nog 150 px verschoven staat: de sprong valt 150 px te kort (controle ronde 6). Zet de plek recht met de
      // verschuiving meegerekend, en nog eens als de overgang klaar is; niet als de bezoeker zelf al scrolde.
      var zelfGescrold = false;
      var markeer = function () { zelfGescrold = true; };
      ['wheel', 'touchstart', 'keydown'].forEach(function (s) { window.addEventListener(s, markeer, { once: true, passive: true }); });
      var naarAnker = function () {
        if (zelfGescrold || !location.hash) return;
        var doel = null;
        try { doel = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e) { /* ongeldig anker */ }
        var hoofd = document.querySelector('main');
        if (!doel || !hoofd || !hoofd.contains(doel)) return;
        var verschuiving = new DOMMatrix(getComputedStyle(hoofd).transform).m42 || 0;
        var marge = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
        window.scrollTo({ top: doel.getBoundingClientRect().top - verschuiving + window.scrollY - marge, behavior: 'instant' });
      };
      var binnenKlaar = function () {
        html.classList.remove('overgang-binnen', 'binnen-loopt');
        ['pointerdown', 'keydown'].forEach(function (s) { window.removeEventListener(s, binnenKlaar, true); });
        naarAnker();
      };
      ['pointerdown', 'keydown'].forEach(function (s) { window.addEventListener(s, binnenKlaar, true); });
      var binnenStart = function () {
        requestAnimationFrame(function () {
          if (!html.classList.contains('overgang-binnen')) return;
          naarAnker();
          html.classList.add('binnen-loopt');
          setTimeout(binnenKlaar, 1050);
        });
      };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', binnenStart); else binnenStart();
    } else {
      html.classList.remove('overgang-binnen');
    }
    setTimeout(heroKlaar, vanOvergang ? 250 : 0);
  }

  // Interne links naar een andere pagina: eerst het kleurvlak, dan pas wisselen.
  if (overgang && !stil) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target === '_blank') return;
      var url = new URL(a.getAttribute('href'), location.href);
      var zelfdePagina = url.pathname.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');
      if (url.origin !== location.origin && location.protocol !== 'file:') return;
      if (url.protocol !== location.protocol || zelfdePagina || /^(mailto|tel):/.test(a.getAttribute('href')) || !/(\.html|\/)$|^[^.]*$/.test(url.pathname)) return;
      e.preventDefault();
      // Weg: een vlak in een willekeurige paletkleur schuift in 1 s van boven naar beneden; de pagina zakt mee
      var kleur = OVERGANG_KLEUREN[Math.floor(Math.random() * OVERGANG_KLEUREN.length)];
      opslag.zet('lux-overgang', kleur);
      html.style.setProperty('--overgang-kleur', kleur);
      html.classList.remove('overgang-binnen', 'binnen-loopt');
      void overgang.offsetWidth;
      overgang.classList.add('weg');
      html.classList.add('overgang-weg');
      setTimeout(function () { location.href = url.href; }, 1000);
    });
    // terug-knop (bfcache): vlak open en pagina op 0
    window.addEventListener('pageshow', function (e) {
      if (!e.persisted) return;
      overgang.classList.remove('weg');
      html.classList.remove('overgang-weg', 'overgang-binnen', 'binnen-loopt');
      opslag.zet('lux-overgang', '0');
    });
  }

  /* ---------------------------------------------------------------
     2. Menu over het hele scherm (burger)
     --------------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu-scherm');
  if (burger && menu) {
    var vorigeFocus = null;
    var openMenu = function () {
      vorigeFocus = document.activeElement;
      // de foto achter het menu pas ophalen als het menu opengaat (ronde 7: scheelt 113 kB bij het laden van elke pagina)
      var mf = menu.querySelector('img.menu-foto[data-src]');
      if (mf) { mf.src = mf.dataset.src; mf.removeAttribute('data-src'); }
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('open'); });
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Menu sluiten');
      html.classList.add('menu-is-open');
      setTimeout(function () { var eerste = menu.querySelector('a'); if (eerste) eerste.focus({ preventScroll: true }); }, stil ? 0 : 350);
    };
    var sluitMenu = function (focusTerug) {
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Menu openen');
      html.classList.remove('menu-is-open');
      setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, stil ? 0 : 800);
      if (focusTerug !== false && vorigeFocus && vorigeFocus.focus) vorigeFocus.focus({ preventScroll: true });
    };
    burger.addEventListener('click', function () { if (burger.getAttribute('aria-expanded') === 'true') sluitMenu(); else openMenu(); });
    // de menufoto al ophalen bij aanwijzen of focus van de burger, zodat hij er staat als het menu opengaat
    var menuFotoLaden = function () { var mf = menu.querySelector('img.menu-foto[data-src]'); if (mf) { mf.src = mf.dataset.src; mf.removeAttribute('data-src'); } };
    burger.addEventListener('pointerenter', menuFotoLaden, { once: true });
    burger.addEventListener('focus', menuFotoLaden, { once: true });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) sluitMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (burger.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { e.preventDefault(); sluitMenu(); return; }
      if (e.key === 'Tab') { // focus binnen menu + burger houden
        var lijst = [burger].concat(Array.prototype.slice.call(menu.querySelectorAll('a')));
        var i = lijst.indexOf(document.activeElement);
        if (e.shiftKey && (i <= 0)) { e.preventDefault(); lijst[lijst.length - 1].focus(); }
        else if (!e.shiftKey && i === lijst.length - 1) { e.preventDefault(); lijst[0].focus(); }
      }
    });
  }

  /* ---------------------------------------------------------------
     2b. Menu-rij naast de burger (brief 2026-11-06, B): met een muis verschijnen de zes links bij
         aanwijzen van de burger of de rij (na 80 ms; weg 400 ms na het verlaten) of bij focus op de burger.
         Esc of de focus eruit verbergt de rij; een klik op de burger opent het menu over het hele scherm.
         Bovenaan (vanaf 1280 px) staan de links al in de header; na 100 px vervagen die.
     --------------------------------------------------------------- */
  var rij = document.querySelector('.menu-rij');
  var rijOpen = false;
  var naBoven = function () { html.classList.toggle('na-100', window.scrollY > 100); };
  naBoven();
  window.addEventListener('scroll', naBoven, { passive: true });
  if (rij && burger) {
    var rijMq = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1240px)'); // zelfde grens als in style.css (gemeten: vanaf 1240 px 24 px lucht tot het logo)
    var openT = null, dichtT = null;
    var magRij = function () {
      return rijMq.matches && getComputedStyle(rij).display !== 'none' && !html.classList.contains('menu-is-open') &&
        !(window.scrollY <= 100 && window.innerWidth >= 1280 && document.querySelector('.site-header .menu'));
    };
    var rijKleur = function () { // wit alleen over de donkere fotokop van Contact (de balk heeft daar geen kleur)
      var b = document.querySelector('.balk');
      var gekleurd = b && /\bop-(kleur|wit|grijs)\b/.test(b.className);
      rij.classList.toggle('wit', html.classList.contains('kop-donker') && !gekleurd);
    };
    var toonRij = function () {
      clearTimeout(dichtT); clearTimeout(openT);
      if (rijOpen || !magRij()) return;
      rijOpen = true;
      html.classList.add('rij-open');
      if (balkBijwerken) balkBijwerken(true);
      rijKleur();
      rij.classList.add('open');
    };
    var verbergRij = function () {
      clearTimeout(openT); clearTimeout(dichtT);
      if (!rijOpen) return;
      rijOpen = false;
      rij.classList.remove('open');
      html.classList.remove('rij-open');
      if (balkBijwerken) balkBijwerken(true);
    };
    [burger, rij].forEach(function (el) {
      el.addEventListener('mouseenter', function () { clearTimeout(dichtT); clearTimeout(openT); openT = setTimeout(toonRij, 80); });
      el.addEventListener('mouseleave', function () { clearTimeout(openT); clearTimeout(dichtT); dichtT = setTimeout(verbergRij, 400); });
      el.addEventListener('focusout', function (e) {
        var naar = e.relatedTarget;
        if (naar && (naar === burger || rij.contains(naar))) return;
        if (burger.matches(':hover') || rij.matches(':hover')) return;
        verbergRij();
      });
    });
    burger.addEventListener('focus', toonRij);
    burger.addEventListener('click', verbergRij);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && rijOpen) verbergRij(); });
    window.addEventListener('scroll', function () { if (rijOpen && !magRij()) verbergRij(); }, { passive: true });
  }

  /* ---------------------------------------------------------------
     3. Collage: meebewegen en licht kantelen met de muis; de foto's wisselen
        samen per schermhelft (set A "Het atelier" op terracotta, set B
        "Het cadeau" op salie). Op touch en met het toetsenbord via de
        wisselrij; een tik op een tegel wisselt ook. Er wisselt niets vanzelf.
     --------------------------------------------------------------- */
  var SALIE = '#C3CFBC';
  // diepe portfoliotinten (wit haalt daar 3:1, alleen voor grote tekst)
  var DIEPE_TINTEN = ['#BC8B47', '#839C75', '#999575', '#C88654', '#AE8C94'];
  var heroSets = [];
  document.querySelectorAll('.hero').forEach(function (hero) {
    var tegels = hero.querySelectorAll('.tegel');
    var cirkel = hero.querySelector('.hero-cirkel');
    if (muis && !stil) {
      // Zoals Stock (feedback Carst 6 nov. 14:28, F1): verschuiving in de absolute muispositie, x = clientX / k en
      // y = -clientY / k (links) of +clientY / k (rechts); k links 20/15/10, rechts 20/10/15 (groot, midden, klein).
      // Kanteling rotateY = 25 x (x / breedte - 0,5), rotateX = 25 x (y / hoogte - 0,5), max. 12,5 graden, met perspectief
      // 1500/1000/500 px (k = 20/15/10). Volgen in 1 s easeOut (CSS-overgang). Vóór de eerste beweging: de beginstand.
      var STOCK = { t2: [20, -1], t1: [15, -1], t3: [10, -1], t4: [20, 1], t5: [10, 1], t6: [15, 1] };
      var PERSPECTIEF = { 20: 1500, 15: 1000, 10: 500 };
      // Op het venster (ronde 5): naar de header of het menu bewegen laat de foto's niet terugzwaaien;
      // terug naar de beginstand alleen als de muis het venster verlaat of de hero uit beeld is.
      var heroInBeeld = function () { var r = hero.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; };
      var heroRust = function () { tegels.forEach(function (t) { t.style.transform = ''; }); if (cirkel) cirkel.style.translate = ''; };
      window.addEventListener('mousemove', function (e) {
        if (mobielHero.matches) { heroRust(); return; } // t/m 760 px niet meebewegen of kantelen, ook niet met een muis
        if (!heroInBeeld()) return;
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 2 - 1;
        var y = ((e.clientY - r.top) / r.height) * 2 - 1;
        var ry = 25 * (e.clientX / window.innerWidth - 0.5), rx = 25 * (e.clientY / window.innerHeight - 0.5);
        tegels.forEach(function (t) {
          var naam = (t.className.match(/\bt\d\b/) || [''])[0];
          var st = STOCK[naam] || [15, 1], k = st[0];
          t.style.transform = 'perspective(' + PERSPECTIEF[k] + 'px) translate3d(' + (e.clientX / k).toFixed(1) + 'px,' + (st[1] * e.clientY / k).toFixed(1) + 'px,0) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        });
        if (cirkel) cirkel.style.translate = (-x * 18).toFixed(1) + 'px ' + (-y * 18).toFixed(1) + 'px';
      });
      document.documentElement.addEventListener('mouseleave', heroRust);
      window.addEventListener('scroll', function () { if (!heroInBeeld()) heroRust(); }, { passive: true });
    }
    // De kop staat naast de foto's, niet erop: is de langste regel (afhankelijk
    // van het lettertype) breder dan de ruimte tot de foto rechts ervan, dan
    // wordt de kop iets kleiner (12 px lucht). Vanaf 761 px; op de mobiele hero staat de kop onder de foto's.
    // Tablet (t/m 1024 px, brief 2026-11-07-homepage-mobiel-stock, D9): gemeten met de woorden (.w, de vakken van de
    // woorden die opkomen) en het vak van de kop, tegen elke foto in rust (zonder de opkomverschuiving); minstens 12 px vrij.
    var kop = hero.querySelector('.hero-tekst .kop-xl');
    if (kop) {
      var basisGrootte = kop.style.fontSize;
      var tegelInRust = function (t) {
        var r = t.getBoundingClientRect(), v = (getComputedStyle(t).translate || '').split(' ');
        var dx = parseFloat(v[0]) || 0, dy = parseFloat(v[1]) || 0;
        return { left: r.left - dx, right: r.right - dx, top: r.top - dy, bottom: r.bottom - dy };
      };
      var kopVak = function () {
        var vak = kop.getBoundingClientRect();
        var l = vak.left, rr = vak.right, b = vak.top, o = vak.bottom;
        var woorden = kop.querySelectorAll('.w');
        var delen = woorden.length ? Array.prototype.slice.call(woorden).map(function (w) { return w.getBoundingClientRect(); })
          : (function () { var rg = document.createRange(); rg.selectNodeContents(kop); return Array.prototype.slice.call(rg.getClientRects()); })();
        delen.forEach(function (d) { if (!d.width) return; l = Math.min(l, d.left); rr = Math.max(rr, d.right); b = Math.min(b, d.top); o = Math.max(o, d.bottom); });
        return { left: l, right: rr, top: b, bottom: o };
      };
      var pasKopInTablet = function () {
        for (var poging = 0; poging < 10; poging++) {
          var k = kopVak(), teKrap = false;
          tegels.forEach(function (t) {
            if (getComputedStyle(t).display === 'none') return;
            var r = tegelInRust(t);
            var gat = Math.max(r.left - k.right, k.left - r.right, r.top - k.bottom, k.top - r.bottom);
            if (gat < 12) teKrap = true;
          });
          if (!teKrap) break;
          kop.style.fontSize = Math.floor(parseFloat(getComputedStyle(kop).fontSize) * 0.95) + 'px';
        }
      };
      var pasKopIn = function () {
        kop.style.fontSize = basisGrootte;
        if (window.innerWidth <= 760 || mobielHero.matches) return;
        if (window.innerWidth <= 1024) { pasKopInTablet(); return; }
        for (var poging = 0; poging < 4; poging++) {
          var bereik = document.createRange(); bereik.selectNodeContents(kop);
          var regels = Array.prototype.slice.call(bereik.getClientRects()); // per regel(deel) van de tekst
          var links = kop.getBoundingClientRect().left, factor = 1;
          tegels.forEach(function (t) {
            var r = t.getBoundingClientRect();
            if (r.left <= links) return;
            regels.forEach(function (g) {
              if (g.width && g.bottom > r.top && g.top < r.bottom && g.right > r.left - 12) factor = Math.min(factor, (r.left - 12 - links) / (g.right - links));
            });
          });
          if (factor >= 1) break;
          kop.style.fontSize = Math.floor(parseFloat(getComputedStyle(kop).fontSize) * factor) + 'px';
        }
      };
      pasKopIn();
      window.addEventListener('resize', pasKopIn);
      bijWissel(mobielHero, pasKopIn);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(pasKopIn);
      document.addEventListener('lux:klaar', function () { if (window.innerWidth <= 1024) pasKopIn(); });
    }
    if (!hero.hasAttribute('data-wissel')) return; // alleen de homepage heeft twee sets
    var knoppen = Array.prototype.slice.call(hero.querySelectorAll('.hero-wissel button'));
    var huidigeSet = 'a';
    function zetSet(s) {
      huidigeSet = s;
      hero.classList.toggle('toon-b', s === 'b');
      knoppen.forEach(function (k) { k.setAttribute('aria-pressed', k.dataset.set === s ? 'true' : 'false'); });
      zetHeroKleur(s === 'b' ? SALIE : '');
    }
    heroSets.push(function () { if (huidigeSet !== 'a') zetSet('a'); });
    knoppen.forEach(function (k) { k.addEventListener('click', function () { zetSet(k.dataset.set); }); });
    if (!muis) tegels.forEach(function (t) { t.addEventListener('click', function () { zetSet(huidigeSet === 'a' ? 'b' : 'a'); }); });
    if (muis) {
      hero.addEventListener('mousemove', function (e) {
        var s = e.clientX < window.innerWidth / 2 ? 'a' : 'b';
        if (s !== huidigeSet || heroKleurNu !== (s === 'b' ? SALIE : '')) zetSet(s);
      });
    }
  });

  later(function () { // na de eerste weergave: kortere taken bij het laden (harness: TBT)
  /* ---------------------------------------------------------------
     4. Portfolio: hover-lijst met foto's en achtergrondkleur
     --------------------------------------------------------------- */
  // 4a. Portfolio met vijf sferen: alles tegelijk in 1 s rustig in-uit (laag in een
  //     diepe tint, alle tekst wit, foto's met productregel, andere namen 0,35); wisselen
  //     tussen items is een crossfade van 0,35 s. Weg, focus uit de lijst of Esc: terug.
  document.querySelectorAll('.hoverlijst.sferen').forEach(function (lijst) {
    var sectie = lijst.closest('.hoverlijst-sectie');
    var knoppen = Array.prototype.slice.call(lijst.querySelectorAll('ul button, ul a')); // knoppen of links (Technieken)
    var sferen = Array.prototype.slice.call(lijst.querySelectorAll('.sfeer'));
    var traagTimer = null;
    function kies(k) {
      var i = knoppen.indexOf(k);
      knoppen.forEach(function (b) { b.classList.toggle('aan', b === k); });
      sferen.forEach(function (s, n) { s.classList.toggle('aan', n === i); });
      lijst.classList.add('actief');
      if (sectie) { sectie.classList.add('lijst-actief'); sectie.style.setProperty('--diep', k.dataset.kleur || ''); }
      clearTimeout(traagTimer); laag.classList.add('traag'); // rustige overgang van 1 s bij aanwijzen
      zetLaag(k.dataset.kleur);
    }
    function reset() {
      if (!lijst.classList.contains('actief')) return;
      lijst.classList.remove('actief');
      if (sectie) sectie.classList.remove('lijst-actief');
      knoppen.forEach(function (b) { b.classList.remove('aan'); });
      lijst.style.setProperty('--my', '0');
      laagBijwerken(true);
      clearTimeout(traagTimer);
      traagTimer = setTimeout(function () { laag.classList.remove('traag'); }, 1000); // daarna weer 0,75 s bij scrollen
    }
    knoppen.forEach(function (k) {
      if (muis) k.addEventListener('mouseenter', function () { kies(k); });
      k.addEventListener('focus', function () { kies(k); });
      if (k.tagName === 'BUTTON') k.addEventListener('click', function () { kies(k); });
    });
    lijst.addEventListener('focusout', function (e) {
      if (e.relatedTarget && lijst.contains(e.relatedTarget)) return;
      if (muis && lijst.matches(':hover')) return; // de muis staat er nog op
      reset();
    });
    lijst.addEventListener('keydown', function (e) { if (e.key === 'Escape') reset(); });
    if (muis) {
      lijst.addEventListener('mouseleave', reset);
      if (!stil) {
        lijst.addEventListener('mousemove', function (e) {
          var r = lijst.getBoundingClientRect();
          lijst.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        });
      }
    }
  });

  // 4b. Portfoliopagina: met een muis kleurt de laag bij aanwijzen in 1 s (rustig) naar de diepe tint
  //     van de groep (data-diep); CSS maakt kop en bijschrift wit. Weg uit het raster: terug naar de
  //     lichte groepskleur. Op touch en zonder JavaScript: geen hoverstand, alles in inkt.
  if (muis) {
    document.querySelectorAll('.portfolio-groep[data-diep]').forEach(function (groep) {
      var raster = groep.querySelector('.werken');
      var werken = Array.prototype.slice.call(groep.querySelectorAll('.werk'));
      if (!raster || !werken.length) return;
      var traagTimer = null;
      werken.forEach(function (w) {
        w.addEventListener('mouseenter', function () {
          werken.forEach(function (x) { x.classList.toggle('aan', x === w); });
          groep.classList.add('aangewezen');
          clearTimeout(traagTimer); laag.classList.add('traag');
          zetLaag(groep.getAttribute('data-diep'));
        });
      });
      raster.addEventListener('mouseleave', function () {
        if (!groep.classList.contains('aangewezen')) return;
        groep.classList.remove('aangewezen');
        werken.forEach(function (x) { x.classList.remove('aan'); });
        laagBijwerken(true);
        clearTimeout(traagTimer);
        traagTimer = setTimeout(function () { laag.classList.remove('traag'); }, 1000);
      });
    });
  }

  document.querySelectorAll('.hoverlijst:not(.sferen)').forEach(function (lijst) {
    var sectie = lijst.closest('.hoverlijst-sectie');
    var groot = lijst.querySelector('.groot');
    var klein = lijst.querySelector('.klein-beeld');
    var knoppen = lijst.querySelectorAll('button');
    function kies(k) {
      knoppen.forEach(function (b) { b.classList.toggle('aan', b === k); b.setAttribute('aria-pressed', b === k ? 'true' : 'false'); });
      groot.src = k.dataset.groot; groot.alt = k.dataset.alt || '';
      klein.src = k.dataset.klein;
      lijst.classList.add('actief');
      zetLaag(k.dataset.kleur);
    }
    function reset() {
      lijst.classList.remove('actief');
      knoppen.forEach(function (b) { b.classList.remove('aan'); b.setAttribute('aria-pressed', 'false'); });
      laagBijwerken(true);
      groot.style.transform = ''; klein.style.transform = '';
    }
    knoppen.forEach(function (k) {
      k.setAttribute('aria-pressed', 'false');
      if (muis) k.addEventListener('mouseenter', function () { kies(k); });
      k.addEventListener('focus', function () { kies(k); });
      k.addEventListener('click', function () { kies(k); });
    });
    if (muis) {
      lijst.addEventListener('mouseleave', reset);
      if (!stil) {
        lijst.addEventListener('mousemove', function (e) {
          var r = lijst.getBoundingClientRect();
          var x = ((e.clientX - r.left) / r.width) * 2 - 1;
          var y = ((e.clientY - r.top) / r.height) * 2 - 1;
          groot.style.transform = 'translate3d(' + (x * 30).toFixed(1) + 'px,' + (y * 20).toFixed(1) + 'px,0)';
          klein.style.transform = 'translate3d(' + (x * -18).toFixed(1) + 'px,' + (y * -12).toFixed(1) + 'px,0)';
        });
      }
    }
    // foto's vooraf laden, alleen als de lijst zichtbaar is (op touch staan de kaarten er)
    if (lijst.offsetParent !== null) knoppen.forEach(function (k) { [k.dataset.groot, k.dataset.klein].forEach(function (s) { var i = new Image(); i.src = s; }); });
  });

  });

  /* ---------------------------------------------------------------
     5. Personaliseren: media-slider. Alleen een klik, Enter of Spatie wisselt
        (aanwijzen en focus niet). De oude foto schuift in 1,2 s naar links weg,
        de nieuwe draait van rechts in; de tekst gaat per regel omhoog weg en
        de nieuwe komt vanaf 0,5 s binnen; de laag kleurt in 0,75 s mee.
        Klik je tijdens een wissel, dan springt die eerst naar het eind.
     --------------------------------------------------------------- */
  document.querySelectorAll('.slider').forEach(function (slider) {
    var sectie = slider.closest('.slider-sectie');
    var lijst = slider.querySelector('.slider-tabs');
    var paneel = slider.querySelector('.slider-teksten');
    var tabs = Array.prototype.slice.call(slider.querySelectorAll('.slider-tab'));
    var dias = Array.prototype.slice.call(slider.querySelectorAll('.dia'));
    var teksten = Array.prototype.slice.call(slider.querySelectorAll('.techniek'));
    if (!lijst || !paneel || !tabs.length) return;
    // tabbladen (rollen pas met JavaScript; zonder JS staan de technieken onder elkaar)
    lijst.setAttribute('role', 'tablist');
    lijst.setAttribute('aria-label', 'Technieken');
    paneel.setAttribute('role', 'tabpanel');
    tabs.forEach(function (t, n) {
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', paneel.id);
    });
    var huidig = 0, lopend = [], opruimen = null;
    var EASE = 'cubic-bezier(.76,0,.24,1)';
    function zetTabs(i) {
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === i ? 'true' : 'false'); t.tabIndex = n === i ? 0 : -1; });
      paneel.setAttribute('aria-labelledby', tabs[i].id);
      teksten.forEach(function (x, n) { x.setAttribute('aria-hidden', n === i ? 'false' : 'true'); });
    }
    function naarHetEind() {
      if (!opruimen) return;
      lopend.forEach(function (a) { try { a.finish(); } catch (e) { /* al klaar */ } });
      var f = opruimen; opruimen = null; f();
    }
    function regels(el) { return Array.prototype.slice.call(el.children); }
    function kies(i) {
      naarHetEind();
      if (i === huidig) return;
      var oud = huidig; huidig = i;
      zetTabs(i);
      if (sectie) { sectie.setAttribute('data-achtergrond', tabs[i].dataset.kleur); laagBijwerken(true); }
      var dOud = dias[oud], dNieuw = dias[i], tOud = teksten[oud], tNieuw = teksten[i];
      dNieuw.classList.add('aan'); tNieuw.classList.add('aan');
      if (stil || !dNieuw.animate) { dOud.classList.remove('aan'); tOud.classList.remove('aan'); return; }
      dNieuw.style.zIndex = '2'; dOud.style.zIndex = '1';
      lopend = [
        dOud.animate([{ transform: 'none' }, { transform: 'translateX(-150%)' }], { duration: 1200, easing: EASE, fill: 'forwards' }),
        dNieuw.animate([{ transform: 'translateX(150%) rotate(90deg)' }, { transform: 'none' }], { duration: 1200, easing: EASE, fill: 'backwards' })
      ];
      regels(tOud).forEach(function (el, n) {
        lopend.push(el.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(-40px)', opacity: 0 }], { duration: 500, delay: n * 60, easing: 'cubic-bezier(.55,0,.1,1)', fill: 'forwards' }));
      });
      regels(tNieuw).forEach(function (el, n) {
        lopend.push(el.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 700, delay: 500 + n * 80, easing: 'cubic-bezier(.33,1,.68,1)', fill: 'backwards' }));
      });
      var deze = function () {
        dOud.classList.remove('aan'); tOud.classList.remove('aan');
        dOud.style.zIndex = ''; dNieuw.style.zIndex = '';
        lopend.forEach(function (a) { a.cancel(); });
        lopend = [];
      };
      opruimen = deze;
      Promise.all(lopend.map(function (a) { return a.finished; })).then(function () {
        if (opruimen === deze) { opruimen = null; deze(); }
      }, function () { /* afgebroken door een nieuwe klik */ });
    }
    tabs.forEach(function (t, n) {
      t.addEventListener('click', function () { kies(n); });
    });
    // pijltoetsen verplaatsen alleen de focus (handmatige activering met Enter of Spatie)
    lijst.addEventListener('keydown', function (e) {
      var n = tabs.indexOf(document.activeElement), doel = null;
      if (n < 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') doel = (n + 1) % tabs.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') doel = (n - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') doel = 0;
      else if (e.key === 'End') doel = tabs.length - 1;
      if (doel === null) return;
      e.preventDefault();
      tabs[doel].focus();
    });
    zetTabs(0);
    if (sectie) sectie.setAttribute('data-achtergrond', tabs[0].dataset.kleur);
  });

  /* ---------------------------------------------------------------
     5b. Homepage 001 Producten (drieluik): aanwijzen en focus regelt CSS (:hover, :focus-within).
         De foto's liggen in rust buiten hun masker; de browser laadt ze dan niet vanzelf (lazy).
         Haal ze op zodra het drieluik in de buurt komt, zodat ze klaarstaan bij het aanwijzen.
     --------------------------------------------------------------- */
  var drieluik = document.querySelector('.drieluik');
  if (drieluik && muis && 'IntersectionObserver' in window) {
    var drieIo = new IntersectionObserver(function (items) {
      if (!items.some(function (it) { return it.isIntersecting; })) return;
      drieluik.querySelectorAll('img[loading="lazy"]').forEach(function (i) { i.loading = 'eager'; });
      drieIo.disconnect();
    }, { rootMargin: '0px 0px 50% 0px' });
    drieIo.observe(drieluik);
  }
  // Binnen de bovenkant blijft de kleur staan zoals bij Stock; wie de bovenkant
  // verlaat, krijgt weer set A en terracotta. Bij focus alleen als de focus
  // echt naar iets buiten de bovenkant gaat (een tik op een lege plek of op
  // een tegel laat de gekozen set staan).
  function terugNaarA() { heroSets.forEach(function (f) { f(); }); zetHeroKleur(''); }
  heroKleurEls.forEach(function (el) {
    el.addEventListener('mouseleave', function (e) {
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hero-kleur')) return;
      terugNaarA();
    });
    el.addEventListener('focusout', function (e) {
      if (!e.relatedTarget || (e.relatedTarget.closest && e.relatedTarget.closest('.hero-kleur'))) return;
      terugNaarA();
    });
  });

  /* ---------------------------------------------------------------
     5c. Achtergrondlaag: secties na de bovenkant zijn doorzichtig; de laag
         vloeit naar de kleur van de sectie waarvan het midden in beeld is
     --------------------------------------------------------------- */
  var lagen = Array.prototype.slice.call(document.querySelectorAll('main > section')).filter(function (sec) {
    // koppen en het drieluik (eigen perzik vlak, kolommen met eigen kleur: geen gebroken strook bij de laagovergang) houden hun eigen kleur
    return !sec.classList.contains('hero-kleur') && !sec.classList.contains('statement') && !sec.matches('.contact-kop, .pagina-kop, .over-kop, .drieluik');
  });
  lagen.forEach(function (sec) {
    if (!sec.hasAttribute('data-achtergrond')) sec.setAttribute('data-achtergrond', getComputedStyle(sec).backgroundColor);
    sec.classList.add('met-laag');
  });
  var laatsteLaag = null;
  function laagBijwerken(forceer) {
    // De laag wisselt zodra een sectie het onderste stukje van het scherm vult
    // (lijn op 88%). Zo staat witte tekst nooit lang op een lichte laag.
    // De laatste sectie waarvan de bovenkant boven de lijn ligt telt, ook als
    // de lijn onderaan de pagina in de footer valt (bijv. na End of #contact).
    // Secties met witte tekst (terracotta, .op-kleur) wisselen al op 88%, zodat wit nooit op een lichte laag staat;
    // secties met alleen inkt pas op de helft, zodat een compact blok in rust zijn eigen kleur houdt (ontwerpgate homepage).
    var vh = window.innerHeight, kies = null;
    lagen.forEach(function (sec) {
      var lijn = vh * (sec.classList.contains('op-kleur') ? 0.88 : 0.5);
      if (sec.getBoundingClientRect().top <= lijn) kies = sec;
    });
    if (kies && (forceer || kies !== laatsteLaag)) { laatsteLaag = kies; zetLaag(kies.getAttribute('data-achtergrond')); }
  }
  if (lagen.length) {
    laagBijwerken(true);
    var laagGepland = false;
    window.addEventListener('scroll', function () {
      if (!laagGepland) { laagGepland = true; requestAnimationFrame(function () { laagGepland = false; laagBijwerken(false); }); }
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     5d. Over, "Hoe ik werk": vanaf 761 px een menu met drie stappen.
         Alleen een klik, Enter of Spatie wisselt (aanwijzen en focus niet);
         de tekst wisselt met een crossfade van 0,4 s (CSS). Mobiel en zonder
         JavaScript staan de stappen onder elkaar.
     --------------------------------------------------------------- */
  document.querySelectorAll('.hoe').forEach(function (sec) {
    var lijst = sec.querySelector('.hoe-tabs');
    var paneel = sec.querySelector('.hoe-stappen');
    var tabs = Array.prototype.slice.call(sec.querySelectorAll('.hoe-tab'));
    var stappen = Array.prototype.slice.call(sec.querySelectorAll('.hoe-stap'));
    if (!lijst || !paneel || !tabs.length) return;
    var breed = window.matchMedia('(min-width: 761px)');
    var huidig = 0;
    function zetTabs() {
      tabs.forEach(function (t, n) { t.setAttribute('aria-selected', n === huidig ? 'true' : 'false'); t.tabIndex = n === huidig ? 0 : -1; });
      stappen.forEach(function (s, n) { s.classList.toggle('aan', n === huidig); s.setAttribute('aria-hidden', n === huidig ? 'false' : 'true'); });
      paneel.setAttribute('aria-labelledby', tabs[huidig].id);
    }
    function stand() {
      var aan = breed.matches;
      sec.classList.toggle('tabs-aan', aan);
      lijst.hidden = !aan;
      // altijd terracotta: zo staat het witte balklogo nooit op een witte balk (ontwerpgate navigatie, punt 1)
      sec.setAttribute('data-achtergrond', '#BC8565');
      laagBijwerken(true);
      if (aan) {
        lijst.setAttribute('role', 'tablist'); lijst.setAttribute('aria-label', 'Hoe ik werk');
        paneel.setAttribute('role', 'tabpanel');
        tabs.forEach(function (t) { t.setAttribute('role', 'tab'); t.setAttribute('aria-controls', paneel.id); });
        zetTabs();
      } else { // onder elkaar: alles leesbaar, geen tab-rollen
        paneel.removeAttribute('role'); paneel.removeAttribute('aria-labelledby');
        stappen.forEach(function (s) { s.removeAttribute('aria-hidden'); });
      }
    }
    tabs.forEach(function (t, n) { t.addEventListener('click', function () { huidig = n; zetTabs(); }); });
    lijst.addEventListener('keydown', function (e) { // pijltoetsen verplaatsen alleen de focus
      var n = tabs.indexOf(document.activeElement), doel = null;
      if (n < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') doel = (n + 1) % tabs.length;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') doel = (n - 1 + tabs.length) % tabs.length;
      else if (e.key === 'Home') doel = 0;
      else if (e.key === 'End') doel = tabs.length - 1;
      if (doel === null) return;
      e.preventDefault(); tabs[doel].focus();
    });
    if (breed.addEventListener) breed.addEventListener('change', stand);
    stand();
  });

  later(function () { // na de eerste weergave: kortere taken bij het laden (harness: TBT)
  /* ---------------------------------------------------------------
     5e. Lichte parallax (alleen met een muis en zonder "minder beweging"):
         de themafoto's schuiven binnen hun kader hooguit 9% op of neer,
         de kopfoto van Contact zakt langzaam mee met scrollen.
     --------------------------------------------------------------- */
  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.thema-foto img, .contact-kop-foto img'));
  if (parallaxEls.length && muis && !stil) {
    var parallaxBijwerken = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (img) {
        var kader = img.parentNode.getBoundingClientRect();
        if (kader.bottom < -50 || kader.top > vh + 50) return;
        var y;
        if (img.closest('.contact-kop-foto')) y = Math.max(0, -kader.top) * 0.3;
        else if (window.innerWidth <= 760) y = 0;
        else {
          var p = ((kader.top + kader.height / 2) - vh / 2) / (vh / 2 + kader.height / 2);
          y = -Math.max(-1, Math.min(1, p)) * kader.height * 0.09;
        }
        img.style.setProperty('--parallax', y.toFixed(1) + 'px');
      });
    };
    var parallaxGepland = false;
    window.addEventListener('scroll', function () {
      if (!parallaxGepland) { parallaxGepland = true; requestAnimationFrame(function () { parallaxGepland = false; parallaxBijwerken(); }); }
    }, { passive: true });
    window.addEventListener('resize', parallaxBijwerken);
    parallaxBijwerken();
  }

  });

  /* ---------------------------------------------------------------
     6. Vaste balk met sectielabel; burger kleurt mee
     --------------------------------------------------------------- */
  var balk = document.querySelector('.balk');
  var secties = Array.prototype.slice.call(document.querySelectorAll('[data-label]'));
  if (balk && kopEl) {
    var label = balk.querySelector('.sectie-label');
    var kleuren = ['op-kleur', 'op-wit', 'op-grijs'];
    var laatste = null;
    var bijwerken = function () {
      var voorbij = kopEl.getBoundingClientRect().bottom < 40 || html.classList.contains('rij-open'); // de balk schuift mee in met de menu-rij
      balk.classList.toggle('zichtbaar', voorbij);
      var huidig = null;
      // Een foto over de volle breedte (.statement, zoals 003 Inspiratie) neemt op mobiel de balk pas over als hij de balk raakt;
      // anders staat er een witte streep tussen de gekleurde balk en de foto (brief 2026-11-07-homepage-mobiel-stock, C8).
      var balkH = window.innerWidth <= 760 ? balk.offsetHeight : 90;
      secties.forEach(function (sec) { if (sec.getBoundingClientRect().top <= (sec.classList.contains('statement') ? Math.min(90, balkH) : 90)) huidig = sec; });
      // Onderaan de pagina komt de laatste sectie nooit tot 90 px; toon dan haar label.
      var doc = document.documentElement;
      if (secties.length && window.scrollY + window.innerHeight >= doc.scrollHeight - 2) huidig = secties[secties.length - 1];
      if (huidig && huidig !== laatste) {
        laatste = huidig;
        label.innerHTML = huidig.getAttribute('data-label');
        var omgeving = huidig.closest('.op-kleur, .op-wit, .op-grijs') || huidig;
        kleuren.forEach(function (k) { balk.classList.toggle(k, omgeving.classList.contains(k)); });
      }
      var diep = false;
      if (laatste) {
        var omg = laatste.closest('.op-kleur, .op-wit, .op-grijs') || laatste;
        balk.style.backgroundColor = omg.classList.contains('met-laag') ? laagKleur : (omg.style.backgroundColor || '');
        // diepe portfoliotint onder de balk: wit logo; label en burger blijven inkt
        diep = omg.classList.contains('met-laag') && DIEPE_TINTEN.indexOf((laagKleur || '').toUpperCase()) >= 0;
      }
      balk.classList.toggle('diep', diep);
      // boven een lichte bovenkant (salie, perzik ...) zijn balklogo en burger donker
      var inBovenkant = !!(laatste && laatste.closest('.hero-kleur'));
      balk.classList.toggle('licht', heroLicht && inBovenkant);
      if (burger) burger.classList.toggle('donker', voorbij ? (!balk.classList.contains('op-kleur') || (heroLicht && inBovenkant)) : heroLicht);
    };
    balkBijwerken = bijwerken;
    var gepland = false;
    window.addEventListener('scroll', function () {
      if (!gepland) { gepland = true; requestAnimationFrame(function () { gepland = false; bijwerken(); }); }
    }, { passive: true });
    bijwerken();
  }

  /* ---------------------------------------------------------------
     7. Koppen per woord uit een masker, tekst en beelden komen op
     --------------------------------------------------------------- */
  function splitsInWoorden(el) {
    var i = 0;
    Array.prototype.slice.call(el.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (deel) {
        if (!deel) return;
        if (/^\s+$/.test(deel)) { frag.appendChild(document.createTextNode(deel)); return; }
        var buiten = document.createElement('span'); buiten.className = 'w';
        var binnen = document.createElement('span'); binnen.textContent = deel; binnen.style.setProperty('--i', i++);
        buiten.appendChild(binnen); frag.appendChild(buiten);
      });
      el.replaceChild(frag, node);
    });
    el.classList.add('woorden-kop');
  }

  if (!stil) {
    document.querySelectorAll('.kop-xl, .kop-l, .kop-m').forEach(splitsInWoorden);
    var heroKop = document.querySelector('.hero .kop-xl');
    if (heroKop) document.addEventListener('lux:klaar', function () { heroKop.classList.add('in-beeld'); }, { once: true });
    if (heroEl && heroEl.classList.contains('klaar') && heroKop) heroKop.classList.add('in-beeld');
  }

  if ('IntersectionObserver' in window && !stil) {
    var io = new IntersectionObserver(function (items) {
      items.forEach(function (it) { if (it.isIntersecting) { it.target.classList.add('in-beeld'); io.unobserve(it.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('main .label, main .quote, main .stap .klein, main .formaat, main .formaten-voet, main .pijl, main .paar .tekst, main .duo .tekst > p, main .insta-foto, main .insta-tekst > p, main .prijs, main .uitgelicht-tekst, main .contact-inleiding, main .formulier').forEach(function (el, i) {
      // niet in de hero, het statement of de paginakop: wat bij het openen al in beeld staat, staat er meteen (snellere LCP)
      if (el.closest('.hero') || el.closest('.statement') || el.closest('.pagina-kop, .over-kop, .contact-kop')) return;
      el.classList.add('opkomen');
      el.style.transitionDelay = ((i % 3) * 0.08).toFixed(2) + 's';
      io.observe(el);
    });
    document.querySelectorAll('main .woorden-kop').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
    /* 003 Zo werkt het: rondjes en lijnstukken tekenen zich één keer, 01 → 02 → 03 (CSS .stappen.teken) */
    document.querySelectorAll('main .stappen').forEach(function (el) { el.classList.add('teken'); io.observe(el); });
    document.querySelectorAll('main .paar > img, main .duo .beelden img, main .uitgelicht-beeld img, main .contact-foto').forEach(function (img) { img.classList.add('zoom'); io.observe(img); });
  }

  later(function () { // na de eerste weergave: kortere taken bij het laden (harness: TBT)
  /* ---------------------------------------------------------------
     8. Lopende tekst (CSS: een halve spoorbreedte in 15 s, los van het
        scrollen) pauzeert buiten beeld; de foto in Uitgelicht schuift licht
        mee met de muis boven de lopende regel. De badge draait mee met scrollen.
     --------------------------------------------------------------- */
  var lopers = Array.prototype.slice.call(document.querySelectorAll('.lopend'));
  if ('IntersectionObserver' in window && lopers.length) {
    var lopIo = new IntersectionObserver(function (items) {
      items.forEach(function (it) { it.target.classList.toggle('pauze', !it.isIntersecting); });
    });
    lopers.forEach(function (l) { lopIo.observe(l); });
  }
  if (muis && !stil) {
    document.querySelectorAll('.uitgelicht').forEach(function (blok) {
      var beeld = blok.querySelector('.uitgelicht-beeld');
      var regel = blok.querySelector('.lopend');
      if (!beeld || !regel) return;
      blok.addEventListener('mousemove', function (e) {
        var r = regel.getBoundingClientRect();
        if (e.clientY < r.top || e.clientY > r.bottom) { beeld.style.translate = ''; return; }
        var b = beeld.getBoundingClientRect();
        var dx = Math.max(-36, Math.min(36, (e.clientX - (b.left + b.width / 2 - (parseFloat(beeld.style.translate) || 0))) * 0.05));
        beeld.style.translate = dx.toFixed(1) + 'px 0';
      });
      blok.addEventListener('mouseleave', function () { beeld.style.translate = ''; });
    });
  }
  var badges = Array.prototype.slice.call(document.querySelectorAll('.badge'));
  if (!stil && badges.length) {
    var draaiBadges = function () {
      var y = window.scrollY;
      badges.forEach(function (b) { b.style.transform = 'rotate(' + (y * 0.18).toFixed(1) + 'deg)'; });
    };
    var badgeGepland = false;
    window.addEventListener('scroll', function () {
      if (!badgeGepland) { badgeGepland = true; requestAnimationFrame(function () { badgeGepland = false; draaiBadges(); }); }
    }, { passive: true });
  }

  });

  later(function () { // na de eerste weergave: kortere taken bij het laden (harness: TBT)
  /* ---------------------------------------------------------------
     9. Eigen cursor (alleen met een muis)
     --------------------------------------------------------------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && muis && !stil) {
    var cLabel = cursor.querySelector('.cursor-label');
    var mx = -100, my = -100, cx = -100, cy = -100;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY; cursor.classList.add('zichtbaar');
      var doel = e.target.closest('[data-cursor], a, button, [role="button"], input, select, textarea, label');
      var tekst = doel && doel.getAttribute('data-cursor');
      cursor.classList.toggle('label', !!tekst);
      cursor.classList.toggle('groot', !!doel && !tekst);
      if (tekst) cLabel.textContent = tekst;
      var kleurvlak = e.target.closest('.op-kleur, .statement, .menu-scherm, .contact-kop');
      if (kleurvlak && heroLicht && kleurvlak.closest('.hero-kleur')) kleurvlak = null;
      cursor.classList.toggle('op-kleur-c', !!kleurvlak && !tekst);
    });
    document.addEventListener('mouseleave', function () { cursor.classList.remove('zichtbaar'); });
    var volg = function () {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cursor.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      requestAnimationFrame(volg);
    };
    requestAnimationFrame(volg);
  }

  });

  /* ---------------------------------------------------------------
     10. Vloeiend scrollen zoals stockdutchdesign.com
         Stock gebruikt een "virtual scroll" met ease 0,05 per beeld: de pagina
         glijdt achter het wiel aan en loopt rustig uit. Wij doen hetzelfde met
         de gewone scroll van de browser, zodat ankers, zoeken, schermlezers en
         de scrollbalk blijven werken. Op touch blijft het native, net als Stock.
     --------------------------------------------------------------- */
  if (muis && !stil) {
    html.classList.add('zacht-scrollen');
    var EASE_WIEL = 0.05;         // zelfde waarde als Stock (per beeld bij 60 fps)
    var EASE_TOETS = 0.14;        // toetsenbord iets vlotter, zodat het niet traag voelt
    var EASE = EASE_WIEL;
    var doelY = window.scrollY, nuY = window.scrollY, bezig = false, vorigeT = 0, eigenScroll = false;
    var maxY = function () { return document.documentElement.scrollHeight - window.innerHeight; };
    var beperk = function (y) { return Math.max(0, Math.min(maxY(), y)); };
    var stap = function (t) {
      var dt = vorigeT ? Math.min(64, t - vorigeT) : 16.7;
      vorigeT = t;
      var f = 1 - Math.pow(1 - EASE, dt / 16.7); // gelijk gevoel op 60, 120 en 144 Hz
      nuY += (doelY - nuY) * f;
      if (Math.abs(doelY - nuY) < 0.4) { nuY = doelY; bezig = false; }
      eigenScroll = true;
      window.scrollTo({ top: nuY, behavior: 'instant' });
      if (bezig) requestAnimationFrame(stap); else vorigeT = 0;
    };
    var glijNaar = function (y) {
      if (!bezig) { nuY = window.scrollY; }
      doelY = beperk(y);
      if (!bezig) { bezig = true; vorigeT = 0; requestAnimationFrame(stap); }
    };
    window.addEventListener('wheel', function (e) {
      if (e.ctrlKey || html.classList.contains('menu-is-open') || e.target.closest('textarea, select, .menu-scherm')) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      var d = e.deltaY * (e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? window.innerHeight : 1);
      EASE = EASE_WIEL;
      glijNaar((bezig ? doelY : window.scrollY) + d);
    }, { passive: false });
    // Toetsenbord glijdt mee (zoals bij Stock), behalve in formuliervelden
    window.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || html.classList.contains('menu-is-open')) return;
      if (e.target.closest('input, textarea, select, button, [role="button"], [contenteditable]')) return;
      var h = window.innerHeight, basis = bezig ? doelY : window.scrollY, y = null;
      if (e.key === 'ArrowDown') y = basis + 120;
      else if (e.key === 'ArrowUp') y = basis - 120;
      else if (e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) y = basis + h * 0.85;
      else if (e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) y = basis - h * 0.85;
      else if (e.key === 'Home') y = 0;
      else if (e.key === 'End') y = maxY();
      if (y === null) return;
      e.preventDefault();
      EASE = EASE_TOETS;
      glijNaar(y);
    });
    // Ankerlinks op dezelfde pagina glijden ook
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var url = new URL(a.href, location.href);
      if (url.pathname.replace(/index\.html$/, '') !== location.pathname.replace(/index\.html$/, '') || !url.hash) return;
      var doel = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!doel) return;
      e.preventDefault();
      if (html.classList.contains('menu-is-open') && burger) burger.click();
      var marge = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
      EASE = EASE_TOETS;
      glijNaar(doel.getBoundingClientRect().top + window.scrollY - marge);
      history.pushState(null, '', url.hash);
      if (!doel.hasAttribute('tabindex')) doel.setAttribute('tabindex', '-1');
      ankerFocus = true; doel.focus({ preventScroll: true }); ankerFocus = false;
    });
    // Scrollbalk slepen, zoeken op de pagina e.d.: overnemen waar de browser is
    window.addEventListener('scroll', function () {
      if (eigenScroll) { eigenScroll = false; return; }
      if (!bezig) { doelY = nuY = window.scrollY; }
    }, { passive: true });
    window.addEventListener('mousedown', function (e) { if (e.target === html) bezig = false; }); // scrollbalk vastpakken
    // Focus (Tab, formulier) gaat voor: stop het glijden, zodat de browser het veld in beeld houdt
    var ankerFocus = false;
    document.addEventListener('focusin', function () { if (ankerFocus) return; bezig = false; doelY = nuY = window.scrollY; });
  }

  /* ---------------------------------------------------------------
     11. Formulier-foutmelding en jaartal
     --------------------------------------------------------------- */
  // Twee soorten fout (brief 2026-11-11): ongeldige invoer (?verzonden=fout) of versturen mislukt (&reden=versturen).
  var MELDINGEN = {
    ongeldig: '<strong>Je bericht is niet verstuurd.</strong> Controleer je naam, e-mailadres en bericht.',
    versturen: '<strong>Je bericht is niet verstuurd.</strong> Dat ligt niet aan jou: er ging iets mis bij het versturen. Probeer het later nog eens, of stuur Carien een <a href="https://wa.me/31643791618">WhatsApp</a> of <a href="mailto:info.LUXmini@gmail.com">mail</a>.'
  };
  // De foutmelding staat in een eigen element boven de privacyzin (die blijft staan, met de link naar privacy.html);
  // bij opnieuw versturen wordt hetzelfde element hergebruikt, dus nooit twee meldingen.
  var toonFout = function (soort) {
    var privacy = document.querySelector('.formulier .melding:not(.fout)');
    var m = document.querySelector('.formulier .melding.fout');
    if (!m) {
      if (!privacy) return null;
      m = document.createElement('p');
      m.className = 'melding fout';
      m.setAttribute('role', 'alert');
      m.setAttribute('tabindex', '-1');
      privacy.parentNode.insertBefore(m, privacy);
    }
    m.innerHTML = MELDINGEN[soort] || MELDINGEN.ongeldig;
    return m;
  };
  // melding en verstuurknop samen in beeld, direct (zonder glijden, dus ook goed bij "minder beweging").
  // Na de eerste sprong nog één keer meten en corrigeren (ontwerpgate 11 nov.): een glijdende scroll van de browser
  // (bijv. focus op een veld met scroll-behavior: smooth) kan nog lopen. Met `veld` blijft dat veld ook in beeld.
  var meldingInBeeld = function (m, veld) {
    var pas = function () {
      var knopEl = m.parentNode && m.parentNode.querySelector('button[type="submit"]');
      var balkEl = document.querySelector('.balk');
      var boven = (balkEl ? balkEl.offsetHeight : 0) + 16; // de vaste balk bedekt de bovenkant
      var onder = window.innerHeight - 16;
      var top = m.getBoundingClientRect().top;
      var bodem = knopEl ? Math.max(knopEl.getBoundingClientRect().bottom, m.getBoundingClientRect().bottom) : m.getBoundingClientRect().bottom;
      var dy = 0;
      if (bodem > onder) dy = bodem - onder;           // knop onder de rand: omhoog schuiven
      if (veld) dy = Math.min(dy, veld.getBoundingClientRect().top - boven); // het foute veld blijft zichtbaar
      if (top - dy < boven) dy = top - boven;          // maar de melding blijft altijd zichtbaar
      if (Math.abs(dy) < 1) return false;
      window.scrollTo({ top: window.scrollY + dy, behavior: 'instant' });
      return true;
    };
    var gesprongen = pas();
    var verwacht = window.scrollY;
    // Nameting alleen zolang de bezoeker niet zelf scrolt (controle ronde 3): anders trekken we hem terug naar het formulier.
    var zelf = false;
    var SIGNALEN = ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'];
    var eigen = function () { zelf = true; };
    var naMeten = function () {
      if (zelf) return;
      // zonder foutveld start de browser zelf geen scroll; wijkt de positie af, dan scrolde iemand anders (de bezoeker)
      if (!veld && Math.abs(window.scrollY - verwacht) > 2) return;
      pas();
      verwacht = window.scrollY;
    };
    var naScroll = function () { requestAnimationFrame(naMeten); };
    // scrollend alleen als er echt een scroll loopt: onze eigen sprong, of de focus op het foute veld (kan glijden)
    var luistert = (gesprongen || !!veld) && 'onscrollend' in window;
    SIGNALEN.forEach(function (s) { window.addEventListener(s, eigen, { capture: true, passive: true }); });
    if (luistert) window.addEventListener('scrollend', naScroll, { once: true });
    setTimeout(function () {
      requestAnimationFrame(function () {
        naMeten();
        // altijd opruimen: geen luisteraar blijft hangen
        if (luistert) window.removeEventListener('scrollend', naScroll);
        SIGNALEN.forEach(function (s) { window.removeEventListener(s, eigen, { capture: true }); });
      });
    }, 450);
  };
  if (/[?&]verzonden=fout/.test(location.search)) {
    var m = toonFout(/[?&]reden=versturen(&|$)/.test(location.search) ? 'versturen' : 'ongeldig');
    if (m) {
      // contact.html?verzonden=fout#formulier: zorg dat de melding zonder scrollen in beeld staat
      var toonMelding = function () { setTimeout(function () { meldingInBeeld(m); }, 60); };
      if (document.readyState === 'complete') toonMelding(); else window.addEventListener('load', toonMelding);
    }
  }
  // Versturen met JavaScript (brief 2026-11-11): dezelfde formulierdata via fetch naar dezelfde Worker, zodat bij een fout
  // alle ingevulde velden blijven staan. Zonder JavaScript (of zonder fetch) gewoon de POST met doorverwijzing.
  var verzendForm = document.querySelector('form.formulier[action="/api/contact"]');
  if (verzendForm && window.fetch && window.URLSearchParams && window.FormData) {
    var EMAIL = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/; // zelfde controle als src/formulier.js
    var knop = verzendForm.querySelector('button[type="submit"]');
    var knopTekst = knop ? knop.lastChild : null;
    var bezigMet = false;
    var klaar = function () {
      bezigMet = false;
      if (knop) { knop.disabled = false; knop.removeAttribute('aria-busy'); if (knopTekst) knopTekst.textContent = 'Verstuur bericht'; }
    };
    var mislukt = function (soort) {
      klaar();
      var m = toonFout(soort);
      if (!m) return;
      var veld = null;
      if (soort === 'ongeldig') {
        var v = function (n) { return verzendForm.querySelector('[name="' + n + '"]'); };
        // eerste foute veld in de volgorde van het formulier (bericht, naam, e-mail)
        veld = [v('bericht'), v('naam'), v('email')].filter(function (el) {
          if (!el) return false;
          var w = el.value.trim();
          return el.name === 'email' ? !EMAIL.test(w) : w === '';
        })[0] || null;
      }
      if (veld) { veld.focus(); meldingInBeeld(m, veld); } else { m.focus({ preventScroll: true }); meldingInBeeld(m); }
    };
    verzendForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (bezigMet) return;
      bezigMet = true;
      if (knop) { knop.disabled = true; knop.setAttribute('aria-busy', 'true'); if (knopTekst) knopTekst.textContent = 'Bezig met versturen…'; }
      fetch(verzendForm.action, { method: 'POST', body: new URLSearchParams(new FormData(verzendForm)), credentials: 'same-origin' })
        .then(function (res) {
          var pad = new URL(res.url, location.href);
          if (/^\/bedankt(\.html)?$/.test(pad.pathname)) { location.assign(pad.pathname); return; }
          if (/^\/contact(\.html)?$/.test(pad.pathname) && /[?&]verzonden=fout/.test(pad.search)) {
            mislukt(/[?&]reden=versturen(&|$)/.test(pad.search) ? 'versturen' : 'ongeldig');
            return;
          }
          mislukt('versturen'); // onverwacht antwoord (bijv. 405 of 500)
        })
        .catch(function () { mislukt('versturen'); }); // netwerkfout
    });
  }
  // Vooraf invullen vanaf de productpagina's (contact.html?onderwerp=kraamcadeaubox&formaat=50&thema=giraf#formulier).
  // Alleen bekende waarden tellen; er komt niets uit het adres in de pagina en er wordt niet gefocust.
  var form = document.querySelector('form.formulier');
  if (form && location.search && window.URLSearchParams) {
    var vraag = new URLSearchParams(location.search);
    var sleutel = function (s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); };
    var kies = function (select, waarde) {
      if (!select || !waarde) return false;
      var w = sleutel(waarde);
      var optie = Array.prototype.slice.call(select.options).filter(function (o) { return o.value && sleutel(o.value) === w; })[0];
      if (optie) select.value = optie.value;
      return !!optie;
    };
    kies(form.querySelector('select[name="onderwerp"]'), vraag.get('onderwerp'));
    var formaat = vraag.get('formaat');
    if (/^(35|50|65|80)$/.test(formaat || '')) {
      var rondje = form.querySelector('input[name="box_formaat"][value="' + formaat + '"]');
      if (rondje) rondje.checked = true;
    }
    kies(form.querySelector('select[name="box_thema"]'), vraag.get('thema'));
  }
  // Foto's die pas bij nadering laden (Kraamcadeauboxen 002 en 003, ronde 8): de hele sectie wordt in één keer gevuld
  // zodra hij binnen 1200 px van het scherm komt, ook de foto's die horizontaal in een rij buiten beeld staan.
  // (set B van de hero niet: die laadt laadSetB, alleen voor de tegels die te zien zijn)
  var laatLaden = function (sectie) {
    sectie.querySelectorAll('img[data-src]:not(.set-b)').forEach(function (img) {
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    });
  };
  var lateSecties = Array.prototype.slice.call(document.querySelectorAll('main > section')).filter(function (s) { return s.querySelector('img[data-src]:not(.set-b)'); });
  if (lateSecties.length) {
    if ('IntersectionObserver' in window) {
      var laatIo = new IntersectionObserver(function (items) {
        items.forEach(function (it) { if (it.isIntersecting) { laatLaden(it.target); laatIo.unobserve(it.target); } });
      }, { rootMargin: '1200px 0px 1200px 0px' });
      lateSecties.forEach(function (s) { laatIo.observe(s); });
    } else lateSecties.forEach(laatLaden);
    var allesLaden = function () { lateSecties.forEach(laatLaden); };
    // afdrukken zonder eerst te scrollen: alles direct laden (controle ronde 7)
    window.addEventListener('beforeprint', allesLaden);
    var printMq = window.matchMedia && window.matchMedia('print');
    if (printMq) { var bijPrint = function (m) { if (m.matches) allesLaden(); }; if (printMq.addEventListener) printMq.addEventListener('change', bijPrint); else if (printMq.addListener) printMq.addListener(bijPrint); }
    // en kort na het laden, als de browser niets te doen heeft (ná de LCP), zodat ze er ook zonder scrollen vroeg genoeg zijn
    var stilLaden = function () { if (window.requestIdleCallback) window.requestIdleCallback(allesLaden, { timeout: 3000 }); else setTimeout(allesLaden, 1500); };
    if (document.readyState === 'complete') setTimeout(stilLaden, 1000); else window.addEventListener('load', function () { setTimeout(stilLaden, 1000); });
  }
  // Carrousels (thema's en stoffen op Kraamcadeauboxen, fotorij op Werkwijze; feedback Carst 11 nov.: geen scrollbalk):
  // pijlknoppen schuiven één set verder (zoveel tegels als er binnen de rand passen; scroll-snap legt hem precies neer);
  // aan het begin of eind is de knop uit. Vegen op touch en de pijltoetsen in de rij werken vanzelf.
  document.querySelectorAll('.carrousel').forEach(function (rij) {
    var knoppen = Array.prototype.slice.call(document.querySelectorAll('.carrousel-knop[aria-controls="' + rij.id + '"]'));
    var stand = function () {
      var max = rij.scrollWidth - rij.clientWidth - 2;
      // aria-disabled in plaats van disabled: de focus blijft op de knop staan (ontwerpgate ronde 3)
      knoppen.forEach(function (k) { k.setAttribute('aria-disabled', (k.dataset.richting === '-1' ? rij.scrollLeft <= 2 : rij.scrollLeft >= max) ? 'true' : 'false'); });
    };
    knoppen.forEach(function (k) {
      k.addEventListener('click', function () {
        if (k.getAttribute('aria-disabled') === 'true') return;
        var spoor = rij.querySelector('ul') || rij, st = getComputedStyle(spoor), tegel = spoor.firstElementChild;
        var gat = parseFloat(st.columnGap) || 0;
        var binnen = rij.clientWidth - (spoor === rij ? 0 : (parseFloat(st.paddingLeft) || 0) + (parseFloat(st.paddingRight) || 0));
        var stap = tegel ? tegel.getBoundingClientRect().width + gat : binnen;
        var aantal = Math.max(1, Math.floor((binnen + gat + 1) / stap)); // een set: de tegels die helemaal binnen de rand passen
        rij.scrollBy({ left: Number(k.dataset.richting) * aantal * stap, behavior: stil ? 'auto' : 'smooth' });
      });
    });
    rij.addEventListener('scroll', function () { window.requestAnimationFrame(stand); }, { passive: true });
    // Home en End in de rij: naar de eerste of de laatste set (niet de hele pagina)
    rij.addEventListener('keydown', function (e) {
      if (e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      rij.scrollTo({ left: e.key === 'Home' ? 0 : rij.scrollWidth, behavior: stil ? 'auto' : 'smooth' });
    });
    window.addEventListener('resize', stand);
    stand();
    // opnieuw meten zodra de rij in beeld komt (de foto's laden pas bij nadering)
    if ('IntersectionObserver' in window) new IntersectionObserver(function (items) { if (items.some(function (it) { return it.isIntersecting; })) stand(); }).observe(rij);
  });
  // Veegbare rijen (Kraamcadeauboxen, producten): alleen een tabstop als de rij echt scrolt (tablet en mobiel), niet op desktop
  var scrollRijen = Array.prototype.slice.call(document.querySelectorAll('[data-scrollrij]'));
  var zetTabstop = function () { scrollRijen.forEach(function (r) { if (r.scrollWidth > r.clientWidth + 1) r.setAttribute('tabindex', '0'); else r.removeAttribute('tabindex'); }); };
  if (scrollRijen.length) {
    zetTabstop(); window.addEventListener('resize', zetTabstop);
    if ('IntersectionObserver' in window) { var rijIo = new IntersectionObserver(function (items) { if (items.some(function (it) { return it.isIntersecting; })) zetTabstop(); }); scrollRijen.forEach(function (r) { rijIo.observe(r); }); }
  }
  document.querySelectorAll('[data-jaar]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
