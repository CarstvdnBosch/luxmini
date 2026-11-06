# Roadmap LUX mini en AI-PDLC

Opgesteld op 7 november 2026 na de eerste livegang van luxmini.nl. De backlog staat als issues op GitHub, gelabeld met `story` of `journey`, een prioriteit en een gebied. Deze roadmap legt de volgorde en de reden vast. De issues zelf staan op GitHub.

**Doel:** een site die aanvragen oplevert voor Carien, gebouwd met een proces dat minder aandacht van Carst kost en dat herbruikbaar is voor zakelijke klanten.

**Succesmaat (voorstel):**
- aanvragen per maand via het formulier;
- het aandeel bezoekers op mobiel dat het formulier bereikt;
- het aantal reviewrondes per pull request (doel: hooguit 2).

## Fase 1 · Stabiliseren (november)

| Wat | Issue | Status |
|---|---|---|
| Mobiele verbeteringen uit de review van 7 november: geen plaatshouders, contactfoto, footer, lettergrootte, prijskaarten | #15 | in uitvoering |
| CI betrouwbaar: browsers in cache, tijdslimiet per stap, TBT-herhaling | #30 | in uitvoering |
| GO via de reactie `GO` in de pull request (besluit Carst, optie 2) | #34 | in uitvoering |
| Intake via een user story of user journey, één story per pull request | #28 | in uitvoering |
| Telstatistiek zonder cookies en een uptime-controle | #26 | gepland |
| Rustigere overgang en intro op mobiel; eerste scherm van de homepage | #16, #17 | gepland |

## Fase 2 · Systematiseren (december)

| Wat | Issue |
|---|---|
| Ontwerptokens: een vaste schaal voor letters en ruimte, met een toets | #33 |
| Tests per user story met codegen, video's in het validatierapport, dekking per pagina | #31 |
| Tests van gedrag en stabiliteit (aanwijzen, ankers, schermafdrukken per schermhoogte) | #29 |
| Vindbaarheid: een pagina per thema en gestructureerde gegevens | #24 |
| Google Business Profile (Carst of Carien) | #25 |
| Adminpagina voor Carien: inloggen, product-marktfit, administratie en een eenvoudige factuur. Wacht op de Excel en een voorbeeldfactuur. | #35 |
| Inhoud die Carien zelf kan bijwerken (teksten, prijzen, foto's) met dezelfde controles | nog aan te maken |

## Fase 3 · Opschalen (vanaf januari)

| Wat | Issue |
|---|---|
| Synthetische bewaking van kernreizen op de live site | #32 |
| Nazorg: product-marktfit voor LUX mini, als eerste case | #36 |
| Herbruikbaar startsjabloon en playbook voor zakelijke klanten (rollen, beveiliging, AVG, audit, staging) | #37 |
| Salesdeck "How I run an AI-PDLC" (Engels) | buiten de repo, als Slides-artifact |
| Pinterest (optioneel) | #27 |

## Wacht op input

- **Carien:**
  - prijsrichtlijnen (#20);
  - formulierkeuzes (#21);
  - foto's (#22);
  - antwoorden voor de FAQ (#19);
  - goedkeuring van de teksten met LET OP.
- **Carst:**
  - Excel en voorbeeldfactuur (#35);
  - de verificatiecode van Pinterest (#27);
  - besluit over een private repository met GitHub Pro (#37).

## Werkafspraken die uit 6 november volgen

1. **Eén story per pull request.** De homepage-wijziging had negen rondes nodig omdat er zes onderwerpen in zaten.
2. **Open vragen eerst beslissen.** Prijzen, teksten en foto's worden vóór het bouwen vastgelegd, of er komt een plaatshouder-gate.
3. **Feedback gebundeld.** Eén keer de preview bekijken en alles in één bericht sturen; nieuwe ideeën gaan naar de backlog, niet naar de lopende release.
4. **Mobiel eerst.** Elke brief beschrijft per sectie eerst 390 px.
5. **Zuinig met tokens.** Reviews meten alleen wat veranderd is, en routinewerk krijgt een kleiner model.
