// Beheer: opslag in Cloudflare D1 (binding BEHEER_DB, jurisdictie EU; brief R11).
// Tabellen: migrations/0001_beheer.sql. In S1 alleen de boekjaren; boekingen volgen in S2.
// Bedragen staan als gehele centen (R12).

/** @param {D1Database} db */
export function maakD1Opslag(db) {
  return {
    async boekjaren() {
      const { results } = await db.prepare('SELECT jaar, afgesloten FROM boekjaren ORDER BY jaar DESC').all();
      return (results || []).map((r) => ({ jaar: Number(r.jaar), afgesloten: Number(r.afgesloten) === 1 }));
    },
  };
}
