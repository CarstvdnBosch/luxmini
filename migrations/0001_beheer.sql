-- Beheer LUX mini: basis van de administratie (brief 2026-11-07-beheer-administratie, S1, criterium 7).
-- Cloudflare D1 (SQLite). Toepassen: npx wrangler d1 migrations apply luxmini-beheer --remote
-- Bedragen altijd als gehele centen (R12). Geen gegevens in dit bestand.

-- Een boekjaar, zoals één Excel per jaar: rekeningnummer, beginsaldo van januari, afgesloten ja/nee.
CREATE TABLE boekjaren (
  jaar             INTEGER PRIMARY KEY CHECK (jaar BETWEEN 2000 AND 2100),
  iban             TEXT,
  beginsaldo_cent  INTEGER NOT NULL DEFAULT 0,
  afgesloten       INTEGER NOT NULL DEFAULT 0 CHECK (afgesloten IN (0, 1)),
  aangemaakt_door  TEXT,
  aangemaakt_op    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  gewijzigd_door   TEXT,
  gewijzigd_op     TEXT
);

-- Rubrieken: de codes van de Excel (kolommen K–AA), namen zoals in de brief (V9). Richting (ontvangen/uitgegeven) staat bij de boeking.
CREATE TABLE rubrieken (
  code  INTEGER PRIMARY KEY,
  naam  TEXT NOT NULL
);
INSERT INTO rubrieken (code, naam) VALUES
  (510,  'Privé (storting/opname)'),
  (1300, 'Verkopen'),
  (1400, 'Inkopen'),
  (1500, 'Omzetbelasting (ontvangen/betaald)'),
  (4000, 'Verzekering'),
  (4100, 'Porto'),
  (4200, 'Bedrijfsbenodigdheden'),
  (4300, 'Rente/bank'),
  (4400, 'Km-vergoeding'),
  (4500, 'Kantoorkosten'),
  (4600, 'Communicatie'),
  (4700, 'Representatie'),
  (4800, 'Overige');

-- Een boeking: één regel op een maandtab van de Excel.
CREATE TABLE boekingen (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  jaar             INTEGER NOT NULL REFERENCES boekjaren (jaar),
  datum            TEXT NOT NULL CHECK (datum GLOB '[0-9][0-9][0-9][0-9]-[0-1][0-9]-[0-3][0-9]'),
  omschrijving     TEXT NOT NULL CHECK (length(omschrijving) BETWEEN 1 AND 200),
  dagafschrift_nr  TEXT,
  rekening         TEXT NOT NULL CHECK (rekening IN ('bank', 'kas')),
  richting         TEXT NOT NULL CHECK (richting IN ('ontvangen', 'uitgegeven')),
  bedrag_cent      INTEGER NOT NULL CHECK (bedrag_cent > 0 AND bedrag_cent <= 100000000),
  btw_code         INTEGER NOT NULL CHECK (btw_code IN (0, 1, 2)),
  aangemaakt_door  TEXT,
  aangemaakt_op    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
  gewijzigd_door   TEXT,
  gewijzigd_op     TEXT,
  versie           INTEGER NOT NULL DEFAULT 1,
  CHECK (substr(datum, 1, 4) = CAST(jaar AS TEXT))
);
CREATE INDEX boekingen_jaar_datum ON boekingen (jaar, datum);

-- Verdeling van een boeking over rubrieken (in release 1 één regel per boeking; later meer zonder migratie).
CREATE TABLE verdeling (
  boeking_id   INTEGER NOT NULL REFERENCES boekingen (id) ON DELETE CASCADE,
  rubriekcode  INTEGER NOT NULL REFERENCES rubrieken (code),
  bedrag_cent  INTEGER NOT NULL,
  PRIMARY KEY (boeking_id, rubriekcode)
);
