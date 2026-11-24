# Mod4Comp

WordPress-Block-Theme für die Website der DFG-Forschungsgruppe **FOR 5880 – Holistic Energy and Performance Modeling for Sustainable Computing (Mod4Comp)**, [www.mod4comp.de](https://www.mod4comp.de).

Stand: Projekt angelegt, Theme noch im Aufbau.

## Voraussetzungen

- WordPress 6.6+
- PHP 8.2+
- Node.js 18+ (nur für Build und Tests)

## Lokal starten (Testserver)

Nur Node.js nötig, kein Docker:

```bash
npm install
npm run build   # style.css + js/*.min.js
npm run dev     # erster freier Port ab 9488, Link steht in der Ausgabe (Login admin / password)
```

`npm run dev` startet WordPress Playground mit diesem Theme, aktiviert es und legt Startseite + SP1–SP7 an (`blueprint-local.json`). Jeder Neustart beginnt frisch.

Die Moodboard-Bilder (`images/*.jpg`, `images/sp/`) sind wegen ungeklärter Lizenz nicht im Repo; ohne sie zeigen die Bildflächen Platzhalter.

## Ansprechpartnerin für das Theme

Milena Rolfes — [GitHub](https://github.com/MimiRolfes)
