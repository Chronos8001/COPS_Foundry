/**
 * Génère les compendiums LevelDB (packs/<nom>) à partir de tools/donnees.mjs et tools/stages.mjs.
 * Usage : npm run build:packs
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { armes, armures, equipement } from "./donnees.mjs";
import { stages } from "./stages.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = { armes, armures, equipement, stages };

/** Identifiant stable de 16 caractères alphanumériques, dérivé du nom. */
function idStable(pack, nom) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const hash = createHash("sha256").update(`${pack}/${nom}`).digest();
  return Array.from(hash.subarray(0, 16), b => alphabet[b % alphabet.length]).join("");
}

const ecrire = (dir, doc) => writeFile(path.join(dir, `${doc._id}.json`), JSON.stringify(doc, null, 2));

for (const [nom, generer] of Object.entries(PACKS)) {
  const sourceDir = path.join(racine, "dist", "_source", nom);
  const packDir = path.join(racine, "packs", nom);
  await rm(sourceDir, { recursive: true, force: true });
  await rm(packDir, { recursive: true, force: true });
  await mkdir(sourceDir, { recursive: true });

  const docs = generer();

  // Dossiers éventuels (champ « dossier » des documents).
  const dossiers = new Map();
  for (const doc of docs) {
    if (!doc.dossier || dossiers.has(doc.dossier)) continue;
    const _id = idStable(`${nom}#dossier`, doc.dossier);
    dossiers.set(doc.dossier, _id);
    await ecrire(sourceDir, {
      _id, _key: `!folders!${_id}`, name: doc.dossier, type: "Item", sorting: "a",
      sort: dossiers.size * 100, color: null, folder: null, description: "", flags: {}
    });
  }

  for (const [i, { dossier, ...doc }] of docs.entries()) {
    const _id = idStable(nom, doc.name);
    await ecrire(sourceDir, {
      _id,
      _key: `!items!${_id}`,
      effects: [],
      folder: dossier ? dossiers.get(dossier) : null,
      sort: i * 100,
      ownership: { default: 0 },
      flags: {},
      ...doc
    });
  }

  await compilePack(sourceDir, packDir, { log: false });
  console.log(`Compendium « ${nom} » : ${docs.length} entrées → packs/${nom}`);
}
