/* LUX mini — interactie naar het voorbeeld van stockdutchdesign.com.
   Alles werkt ook zonder JavaScript (dan is alle inhoud gewoon zichtbaar) en
   bij "minder beweging" (prefers-reduced-motion) staat alle animatie uit. */
(function () {
  'use strict';
  window.luxKlaar = true; // het nood-script in <head> laat de .js-klasse dan staan
  var stil = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var muis = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var html = document.documentElement;
  var opslag = {
    lees: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    zet: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* niet erg */ } }
  };
  var heroEl = document.querySelector('.hero');

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

  /* ---------------------------------------------------------------
     1. Intro-scherm en pagina-overgang
     --------------------------------------------------------------- */
  var intro = document.querySelector('.intro-scherm');
  var overgang = document.querySelector('.overgang');
  var vanOvergang = opslag.lees('lux-overgang') === '1';
  opslag.zet('lux-overgang', '0');

  function heroKlaar() { if (heroEl) heroEl.classList.add('klaar'); document.dispatchEvent(new Event('lux:klaar')); }

  // Het script in <head> heeft al besloten of de intro komt (.intro-aan) en
  // de tijdlijn loopt in CSS. Hier: hero-kop op ~2,35 s, klaar op ~3,05 s,
  // overslaan met tik, klik, toets, scroll of vegen (dan klaar in 0,6 s).
  if (intro && html.classList.contains('intro-aan') && !stil) {
    (function () {
      var doek = intro.querySelector('.intro-doek');
      var figuur = intro.querySelector('.intro-figuur');
      var foto = intro.querySelector('.intro-foto');
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
        bewegers.forEach(function (el) { el.style.transition = 'transform .5s cubic-bezier(.33,1,.68,1)'; el.style.transform = 'none'; });
        intro.classList.add('snel');
        heroKlaar();
        timers.push(setTimeout(opruimen, 540));
      };
      var signalen = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
      signalen.forEach(function (s) { window.addEventListener(s, overslaan, { capture: true, passive: true }); });
      na(600, function () { if (foto && !(foto.complete && foto.naturalWidth > 0) && figuur) figuur.classList.add('zonder-foto'); });
      na(2350, heroKlaar);           // woorden van de hero-kop komen op
      na(3060, opruimen);            // de intro is klaar
    })();
  } else {
    html.classList.remove('intro-aan');
    if (vanOvergang && overgang && !stil) {
      overgang.style.transition = 'none';
      overgang.classList.add('dicht');
      requestAnimationFrame(function () {
        overgang.style.transition = '';
        overgang.classList.remove('dicht');
        overgang.classList.add('open-boven');
        setTimeout(function () { overgang.style.transition = 'none'; overgang.classList.remove('open-boven'); requestAnimationFrame(function () { overgang.style.transition = ''; }); }, 700);
      });
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
      opslag.zet('lux-overgang', '1');
      overgang.classList.add('dicht');
      setTimeout(function () { location.href = url.href; }, 600);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) overgang.classList.remove('dicht'); });
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
     3. Collage: meebewegen en licht kantelen met de muis; de foto's wisselen
        samen per schermhelft (set A "Het atelier" op terracotta, set B
        "Het cadeau" op salie). Op touch en met het toetsenbord via de
        wisselrij; een tik op een tegel wisselt ook. Er wisselt niets vanzelf.
     --------------------------------------------------------------- */
  var SALIE = '#C3CFBC';
  var heroSets = [];
  document.querySelectorAll('.hero').forEach(function (hero) {
    var tegels = hero.querySelectorAll('.tegel');
    var cirkel = hero.querySelector('.hero-cirkel');
    if (muis && !stil) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 2 - 1;
        var y = ((e.clientY - r.top) / r.height) * 2 - 1;
        tegels.forEach(function (t) {
          var d = parseFloat(t.dataset.diepte || '20');
          // perspectief 1000 px, maximaal ±8° kantelen
          t.style.transform = 'perspective(1000px) translate3d(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px,0) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg)';
        });
        if (cirkel) cirkel.style.translate = (-x * 18).toFixed(1) + 'px ' + (-y * 18).toFixed(1) + 'px';
      });
      hero.addEventListener('mouseleave', function () {
        tegels.forEach(function (t) { t.style.transform = ''; });
        if (cirkel) cirkel.style.translate = '';
      });
    }
    // De kop staat naast de foto's, niet erop: is de langste regel (afhankelijk
    // van het lettertype) breder dan de ruimte tot de foto rechts ervan, dan
    // wordt de kop iets kleiner (12 px lucht). Alleen vanaf 761 px.
    var kop = hero.querySelector('.hero-tekst .kop-xl');
    if (kop) {
      var basisGrootte = kop.style.fontSize;
      var pasKopIn = function () {
        kop.style.fontSize = basisGrootte;
        if (window.innerWidth <= 760) return;
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
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(pasKopIn);
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

  /* ---------------------------------------------------------------
     4. Portfolio: hover-lijst met foto's en achtergrondkleur
     --------------------------------------------------------------- */
  // 4a. Portfolio met vijf sferen: alles tegelijk in 0,75 s (laag, foto's,
  //     productregel, andere namen + label + pijl-link naar 0,2); wisselen
  //     tussen items is een crossfade van 0,35 s. Weg, focus uit de lijst of Esc: terug.
  document.querySelectorAll('.hoverlijst.sferen').forEach(function (lijst) {
    var sectie = lijst.closest('.hoverlijst-sectie');
    var knoppen = Array.prototype.slice.call(lijst.querySelectorAll('ul button'));
    var sferen = Array.prototype.slice.call(lijst.querySelectorAll('.sfeer'));
    function kies(k) {
      var i = knoppen.indexOf(k);
      knoppen.forEach(function (b) { b.classList.toggle('aan', b === k); });
      sferen.forEach(function (s, n) { s.classList.toggle('aan', n === i); });
      lijst.classList.add('actief');
      if (sectie) sectie.classList.add('lijst-actief');
      zetLaag(k.dataset.kleur);
    }
    function reset() {
      if (!lijst.classList.contains('actief')) return;
      lijst.classList.remove('actief');
      if (sectie) sectie.classList.remove('lijst-actief');
      knoppen.forEach(function (b) { b.classList.remove('aan'); });
      lijst.style.setProperty('--my', '0');
      laagBijwerken(true);
    }
    knoppen.forEach(function (k) {
      if (muis) k.addEventListener('mouseenter', function () { kies(k); });
      k.addEventListener('focus', function () { kies(k); });
      k.addEventListener('click', function () { kies(k); });
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
     5b. Werkwijze: kolom aanwijzen kleurt de bovenkant en schuift een foto in
     --------------------------------------------------------------- */
  document.querySelectorAll('.kern-kolom').forEach(function (kolom) {
    var p = kolom.querySelector('.kern-copy p');
    function maat() { if (p) kolom.style.setProperty('--u', p.offsetHeight + 'px'); }
    maat();
    window.addEventListener('resize', maat);
    function open() { maat(); kolom.classList.add('open'); zetHeroKleur(kolom.dataset.kleur); }
    function dicht() { kolom.classList.remove('open'); }
    kolom.setAttribute('tabindex', '0'); // toetsenbord: Tab opent de kolom en toont de uitleg
    kolom.addEventListener('focus', open);
    kolom.addEventListener('blur', dicht);
    if (!muis) return;
    kolom.addEventListener('mouseenter', open);
    kolom.addEventListener('mouseleave', dicht);
  });
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
    return !sec.classList.contains('hero-kleur') && !sec.classList.contains('statement');
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
    var lijn = window.innerHeight * 0.88, kies = null;
    lagen.forEach(function (sec) {
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
     6. Vaste balk met sectielabel; burger kleurt mee
     --------------------------------------------------------------- */
  var balk = document.querySelector('.balk');
  var secties = Array.prototype.slice.call(document.querySelectorAll('[data-label]'));
  if (balk && heroEl) {
    var label = balk.querySelector('.sectie-label');
    var kleuren = ['op-kleur', 'op-wit', 'op-grijs'];
    var laatste = null;
    var bijwerken = function () {
      var voorbij = heroEl.getBoundingClientRect().bottom < 40;
      balk.classList.toggle('zichtbaar', voorbij);
      var huidig = null;
      secties.forEach(function (sec) { if (sec.getBoundingClientRect().top <= 90) huidig = sec; });
      // Onderaan de pagina komt de laatste sectie nooit tot 90 px; toon dan haar label.
      var doc = document.documentElement;
      if (secties.length && window.scrollY + window.innerHeight >= doc.scrollHeight - 2) huidig = secties[secties.length - 1];
      if (huidig && huidig !== laatste) {
        laatste = huidig;
        label.innerHTML = huidig.getAttribute('data-label');
        var omgeving = huidig.closest('.op-kleur, .op-wit, .op-grijs') || huidig;
        kleuren.forEach(function (k) { balk.classList.toggle(k, omgeving.classList.contains(k)); });
      }
      if (laatste) {
        var omg = laatste.closest('.op-kleur, .op-wit, .op-grijs') || laatste;
        balk.style.backgroundColor = omg.classList.contains('met-laag') ? laagKleur : (omg.style.backgroundColor || '');
      }
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
    document.querySelectorAll('main .label, main .quote, main .stap .klein, main .prijstabel, main .pijl, main .paar .tekst, main .duo .tekst > p, main .insta a, main .prijs, main .uitgelicht-tekst, main .formulier, main .contact-links').forEach(function (el, i) {
      if (el.closest('.hero') || el.closest('.statement')) return;
      el.classList.add('opkomen');
      el.style.transitionDelay = ((i % 3) * 0.08).toFixed(2) + 's';
      io.observe(el);
    });
    document.querySelectorAll('main .woorden-kop').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
    /* 003 Zo werkt het: rondjes en lijnstukken tekenen zich één keer, 01 → 02 → 03 (CSS .stappen.teken) */
    document.querySelectorAll('main .stappen').forEach(function (el) { el.classList.add('teken'); io.observe(el); });
    document.querySelectorAll('main .paar > img, main .duo .beelden img, main .uitgelicht-beeld').forEach(function (img) { img.classList.add('zoom'); io.observe(img); });
  }

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
      var kleurvlak = e.target.closest('.op-kleur, .statement, .menu-scherm');
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
  if (/[?&]verzonden=fout/.test(location.search)) {
    var m = document.querySelector('.formulier .melding');
    if (m) {
      m.setAttribute('role', 'alert');
      m.innerHTML = '<strong>Je bericht is niet verstuurd.</strong> Controleer je naam, e-mailadres en bericht, of stuur Carien een WhatsApp of mail.';
    }
  }
  document.querySelectorAll('[data-jaar]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
