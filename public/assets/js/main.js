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
  function zetHeroKleur(kleur) {
    heroKleurEls.forEach(function (el) { el.style.backgroundColor = kleur; });
    if (typeof balkBijwerken === 'function') balkBijwerken(true);
  }
  var laag = document.createElement('div');
  laag.className = 'achtergrond';
  laag.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(laag, document.body.firstChild);
  var laagKleur = '';
  function zetLaag(kleur) { if (kleur && kleur !== laagKleur) { laagKleur = kleur; laag.style.backgroundColor = kleur; } }
  var balkBijwerken = null;

  /* ---------------------------------------------------------------
     1. Intro-scherm en pagina-overgang
     --------------------------------------------------------------- */
  var intro = document.querySelector('.intro-scherm');
  var overgang = document.querySelector('.overgang');
  var vanOvergang = opslag.lees('lux-overgang') === '1';
  opslag.zet('lux-overgang', '0');

  function heroKlaar() { if (heroEl) heroEl.classList.add('klaar'); document.dispatchEvent(new Event('lux:klaar')); }

  if (intro) {
    var alGezien = opslag.lees('lux-intro-gezien') === '1';
    if (stil || alGezien || vanOvergang) {
      intro.classList.add('verborgen');
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
    } else {
      opslag.zet('lux-intro-gezien', '1');
      var klaarIntro = function () {
        intro.classList.add('weg');
        setTimeout(heroKlaar, 250);
        setTimeout(function () { intro.classList.add('verborgen'); }, 1000);
      };
      if (document.readyState === 'complete') setTimeout(klaarIntro, 1100);
      else window.addEventListener('load', function () { setTimeout(klaarIntro, 700); });
      setTimeout(function () { if (!intro.classList.contains('weg')) klaarIntro(); }, 2600); // nooit langer wachten
    }
  } else {
    heroKlaar();
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
     3. Collage: meebewegen met de muis en omdraaien
     --------------------------------------------------------------- */
  document.querySelectorAll('.hero').forEach(function (hero) {
    var tegels = hero.querySelectorAll('.tegel');
    if (muis && !stil) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width) * 2 - 1;
        var y = ((e.clientY - r.top) / r.height) * 2 - 1;
        tegels.forEach(function (t) {
          var d = parseFloat(t.dataset.diepte || '20');
          t.style.transform = 'translate3d(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px,0)';
        });
      });
      hero.addEventListener('mouseleave', function () { tegels.forEach(function (t) { t.style.transform = ''; }); });
    }
    if (muis) {
      var helft = '';
      hero.addEventListener('mousemove', function (e) {
        var nu = e.clientX < window.innerWidth / 2 ? 'links' : 'rechts';
        if (nu === helft) return;
        helft = nu;
        zetHeroKleur(nu === 'links' ? getComputedStyle(html).getPropertyValue('--terracotta').trim() : '#B4B19A');
      });
      hero.addEventListener('mouseleave', function () { helft = ''; });
    }
    tegels.forEach(function (t) {
      function draai() { var om = t.classList.toggle('om'); t.setAttribute('aria-pressed', om ? 'true' : 'false'); }
      t.setAttribute('aria-pressed', 'false');
      if (!muis) t.addEventListener('click', draai);
      t.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); draai(); } });
    });
  });

  /* ---------------------------------------------------------------
     4. Portfolio: hover-lijst met foto's en achtergrondkleur
     --------------------------------------------------------------- */
  document.querySelectorAll('.hoverlijst').forEach(function (lijst) {
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
     5. Personaliseren: woordenlijst, foto draait per techniek in beeld
     --------------------------------------------------------------- */
  document.querySelectorAll('.woordenlijst').forEach(function (lijst) {
    var sectie = lijst.closest('.woorden-sectie');
    var knoppen = lijst.querySelectorAll('.woorden button');
    var dias = lijst.querySelectorAll('.dia');
    var teksten = lijst.querySelectorAll('.woorden-uitleg p');
    var huidig = 0;
    function kies(i) {
      if (i === huidig) return;
      dias.forEach(function (d, n) {
        d.classList.toggle('aan', n === i);
        d.classList.toggle('weg', n === huidig);
        if (n !== i && n !== huidig) d.classList.remove('weg');
      });
      var vorige = dias[huidig];
      setTimeout(function () { if (!vorige.classList.contains('aan')) { vorige.style.transition = 'none'; vorige.classList.remove('weg'); void vorige.offsetWidth; vorige.style.transition = ''; } }, stil ? 0 : 1000);
      knoppen.forEach(function (b, n) { b.classList.toggle('aan', n === i); b.setAttribute('aria-pressed', n === i ? 'true' : 'false'); });
      teksten.forEach(function (t, n) { t.classList.toggle('aan', n === i); });
      if (sectie) { sectie.setAttribute('data-achtergrond', knoppen[i].dataset.kleur); laagBijwerken(true); }
      huidig = i;
    }
    knoppen.forEach(function (b, n) {
      if (muis) b.addEventListener('mouseenter', function () { kies(n); });
      b.addEventListener('click', function () { kies(n); });
      b.addEventListener('focus', function () { kies(n); });
    });
    if (sectie) sectie.setAttribute('data-achtergrond', knoppen[0].dataset.kleur);
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
  // verlaat, krijgt weer terracotta (wit op perzik of olijf leest slecht)
  heroKleurEls.forEach(function (el) {
    el.addEventListener('mouseleave', function (e) {
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hero-kleur')) return;
      zetHeroKleur('');
    });
    el.addEventListener('focusout', function (e) {
      if (e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hero-kleur')) return;
      zetHeroKleur('');
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
      if (burger) burger.classList.toggle('donker', voorbij && !balk.classList.contains('op-kleur'));
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
    document.querySelectorAll('main .label, main .quote, main .kolom .nr, main .kolom .klein, main .kolom .lijst-klein, main .pijl, main .paar .tekst, main .duo .tekst > p, main .insta a, main .prijs, main .woorden-tekst, main .uitgelicht-tekst, main .formulier, main .contact-links').forEach(function (el, i) {
      if (el.closest('.hero') || el.closest('.statement')) return;
      el.classList.add('opkomen');
      el.style.transitionDelay = ((i % 3) * 0.08).toFixed(2) + 's';
      io.observe(el);
    });
    document.querySelectorAll('main .woorden-kop').forEach(function (el) { if (!el.closest('.hero')) io.observe(el); });
    document.querySelectorAll('main .paar > img, main .duo .beelden img, main .uitgelicht-beeld').forEach(function (img) { img.classList.add('zoom'); io.observe(img); });
  }

  /* ---------------------------------------------------------------
     8. Lopende tekst en draaiende badge, gekoppeld aan het scrollen
     --------------------------------------------------------------- */
  var sporen = Array.prototype.slice.call(document.querySelectorAll('.lopend-spoor'));
  var badges = Array.prototype.slice.call(document.querySelectorAll('.badge'));
  if (!stil && (sporen.length || badges.length)) {
    var start = performance.now();
    var tik = function (nu) {
      var y = window.scrollY;
      var drift = (nu - start) * 0.02;
      sporen.forEach(function (s) {
        var helft = s.scrollWidth / 2 || 1;
        var x = (y * 0.45 + drift) % helft;
        s.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,0,0)';
      });
      badges.forEach(function (b) { b.style.transform = 'rotate(' + (y * 0.18).toFixed(1) + 'deg)'; });
      requestAnimationFrame(tik);
    };
    requestAnimationFrame(tik);
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
