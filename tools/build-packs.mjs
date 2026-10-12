/**
 * Génère les compendiums LevelDB (packs/<nom>) à partir de tools/donnees.mjs.
 * Usage : npm run build:packs
 */
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { armes, armures, equipement } from "./donnees.mjs";

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKS = { armes, armures, equipement };

/** Identifiant stable de 16 caractères alphanumériques, dérivé du nom. */
function idStable(pack, nom) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const hash = createHash("sha256").update(`${pack}/${nom}`).digest();
  return Array.from(hash.subarray(0, 16), b => alphabet[b % alphabet.length]).join("");
}

for (const [nom, generer] of Object.entries(PACKS)) {
  const sourceDir = path.join(racine, "dist", "_source", nom);
  const packDir = path.join(racine, "packs", nom);
  await rm(sourceDir, { recursive: true, force: true });
  await rm(packDir, { recursive: true, force: true });
  await mkdir(sourceDir, { recursive: true });

  const docs = generer();
  for (const [i, doc] of docs.entries()) {
    const _id = idStable(nom, doc.name);
    const complet = {
      _id,
      _key: `!items!${_id}`,
      effects: [],
      folder: null,
      sort: i * 100,
      ownership: { default: 0 },
      flags: {},
      ...doc
    };
    await writeFile(path.join(sourceDir, `${_id}.json`), JSON.stringify(complet, null, 2));
  }

  await compilePack(sourceDir, packDir, { log: false });
  console.log(`Compendium « ${nom} » : ${docs.length} entrées → packs/${nom}`);
}
