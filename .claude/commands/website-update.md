---
description: Voer een wijziging aan de LUX mini-website uit via de vaste AI-PDLC-stappen (plannen → bouwen → controleren → aanbieden).
argument-hint: <wat je wilt veranderen>
---

Wens: $ARGUMENTS

Volg `docs/ai-pdlc.md`. Werk de stappen in deze volgorde af en sla er geen over:

1. **Plannen:** laat de agent `website-planner` een brief maken in `docs/wijzigingen/`. Staan er open vragen in die de wijziging blokkeren (ontbrekende tekst, foto of prijs), stop dan en leg die vragen aan mij voor.
2. **Bouwen:** laat `website-bouwer` de brief uitvoeren op een eigen branch.
3. **Controleren:** laat `website-controleur` het werk onafhankelijk controleren.
   - NIET AKKOORD: geef de punten aan `website-bouwer` en laat daarna opnieuw controleren. Maximaal 3 rondes. Na 3 rondes stop je en vat je voor mij samen wat er nog misgaat.
4. **Aanbieden:** bij AKKOORD:
   - push de branch naar GitHub (`git push -u origin <branch>`) en open een pull request naar `main` met `gh pr create`, gevuld volgens `.github/pull_request_template.md` (verwijs naar de brief);
   - GitHub draait gate 1 en 2; Cloudflare zet de preview-link in de pull request;
   - geef mij een korte samenvatting: wat er veranderd is, de link naar de brief en wat ik in de preview moet bekijken;
   - geef de link naar de pull request en leg uit dat ik live zet door op **Merge** te klikken als de controles groen zijn.

Zet nooit zelf iets live en merge nooit zelf naar `main`. Dat besluit ligt bij een mens.
