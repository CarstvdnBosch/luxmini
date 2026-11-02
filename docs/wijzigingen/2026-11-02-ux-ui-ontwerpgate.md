# Senior UX/UI-ontwerper en ontwerpgate in de AI-PDLC

- **Datum:** 2026-11-02
- **Aangevraagd door:** Carst
- **Risico:** laag. Alleen het proces en de documentatie veranderen, plus een nieuw script; niets in `public/`.

## Doel
Elke zichtbare wijziging krijgt een professionele UX/UI-blik: richting bij het plannen en een duidelijke ontwerpgate vóór de pull request. Zo blijft de site duidelijk, leesbaar en mooi voor bezoekers.

## Acceptatiecriteria
1. Nieuwe agent `.claude/agents/website-ontwerper.md` (alleen lezen) met twee rollen:
   - ontwerprichting bij het plannen;
   - ontwerpgate met een checklist van 9 punten en het oordeel ONTWERP AKKOORD / NIET AKKOORD.
2. `docs/ontwerp/principes.md` legt de UX-afspraken vast: doelgroep, contact, touch, leesbaarheid met contrastnormen, witruimte, beweging, beeld, toon.
3. `scripts/schermafdrukken.py` maakt schermafdrukken per schermhoogte voor desktop (1440), tablet (768) en mobiel (390). De map staat in `.gitignore`.
4. De gate staat in het hele proces:
   - `docs/ai-pdlc.md`: diagram, fasentabel, Definition of Done, rollen;
   - `CLAUDE.md`;
   - `/website-update`;
   - het brief-sjabloon: secties Ontwerprichting en Ontwerpgate;
   - het pull request-sjabloon;
   - de planner, de bouwer en de controleur.
5. Voor wijzigingen zonder zichtbaar effect mag de ontwerper "n.v.t." geven.
6. Een nulmeting van het huidige ontwerp staat in `docs/ontwerp/review-2026-11-02.md`, met prioriteiten en een voorstel voor vervolgwijzigingen.

## Ontwerprichting
n.v.t. (procesmatige wijziging)

## Buiten scope
De ontwerpverbeteringen zelf. Die volgen als aparte wijzigingen A, B en C uit de review.

## Verloop
| Stap | Wie | Uitkomst |
|---|---|---|
| Plannen | planner-rol | brief opgesteld |
| Bouwen | website-bouwer | agent, principes, script, procesdocumenten en nulmeting gemaakt |
| Controleren | website-controleur | |
| Ontwerpgate | website-ontwerper | n.v.t. (geen zichtbare wijziging) |
| Preview bekeken | Carst | |
| Live gezet (merge) | Carst | |
