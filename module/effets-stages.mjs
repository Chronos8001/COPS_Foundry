/**
 * Effets automatisés des stages.
 *
 * Chaque stage porté par un personnage (bonus selon sa famille et son niveau, plus la capacité spéciale choisie)
 * produit des effets que les jets appliquent :
 *   deBleu            un des dés compte pour 2 réussites s'il réussit (1 seul dé bleu par jet)
 *   desBonus          ± N dés
 *   relance           relance d'un dé en échec (une fois par jet)
 *   adrenaline        Adrénaline autorisée sur ces compétences
 *   adrenalineMulti   plusieurs points d'Adrénaline par jet
 *   seuilMin          niveau minimal de compétence
 *   ancienneteDouble  chaque point d'Ancienneté vaut 2 réussites
 *   encaissement      dé bleu sur les jets de force d'arrêt
 * Un effet avec `condition` est optionnel : il apparaît comme case à cocher dans le dialogue de jet.
 * Filtres : `competences` et/ou `caracs` (l'un ou l'autre suffit) ; sans filtre, l'effet vaut pour tout jet.
 *
 * Les bonus d'attaque (dommages, localisation, tirs visés) et les bonus permanents (PV, salaire, initiative)
 * sont résumés dans l'objet renvoyé par analyserStages().
 */

import { COPS } from "./config.mjs";

const SCIENTIFIQUES =["connaissance", "electronique", "informatique", "mecanique", "sceneDeCrime"];
const INTERROGATOIRE = ["intimidation", "eloquence", "rhetorique"];
const ARMES_A_FEU = ["armePoing", "armeEpaule"];
const PHYSIQUES_ET_SF = ["carrure", "coordination", "reflexes", "sangfroid"];

/** Compétences proposées comme « cible » d'un stage (stocké dans system.cible). */
export const CIBLES_STAGES = {
  tir: ARMES_A_FEU,
  interrogatoire: INTERROGATOIRE
};

const dom = stage => (stage.system.cible ? ` « ${stage.system.cible} »` : "");

/** Bonus de stage (indépendants de la capacité), par « famille:niveau ». */
const BONUS = {
  "artMartial:1": () => [{ type: "deBleu", caracs: ["carrure"], condition: "Résistance aux maladies ou poisons (entraînement quotidien)" }],
  "combatLocalite:1": () => [{ type: "adrenaline", competences: ["instinctDeFlic"] }],
  "criminalistique:1": () => [{ type: "deBleu", competences: SCIENTIFIQUES }],
  "geopolitique:1": s => [{ type: "deBleu", competences: ["connaissance"], condition: `Connaissance du milieu${dom(s)}` }],
  "protection:1": s => [{ type: "deBleu", competences: ["connaissance"], condition: `Connaissance du quartier${dom(s)}` }],
  "sensibilisation:1": s => [{ type: "deBleu", competences: ["connaissance"], condition: `Connaissance de la communauté${dom(s)}` }],
  "interrogatoire:1": s => [{ type: "relance", competences: s.system.cible ? [s.system.cible] : INTERROGATOIRE }],
  "commando:2": () => [{ type: "deBleu", competences: ["athletisme"] }],
  "infiltration:2": s => [{ type: "deBleu", condition: `Connaissance du milieu${dom(s)} ou résistance à un interrogatoire` }],
  "communication:2": () => [{ type: "deBleu", condition: "Démonter une argumentation sectaire" }],
  "protection:2": () => [{ type: "deBleu", competences: ["eloquence"] }],
  "psychologie:2": () => [{ type: "deBleu", competences: ["rhetorique"] }],
  "interrogatoire:2": () => [{ type: "deBleu", competences: ["psychologie"], condition: "Jet initial de rencontre (Psychologie/Perception)" }],
  "commando:3": () => [{ type: "ancienneteDouble", caracs: PHYSIQUES_ET_SF }],
  "criminalistique:3": () => [{ type: "deBleu", caracs: ["education"] }],
  "negociation:3": () => [
    { type: "deBleu", competences: ["psychologie"] },
    { type: "deBleu", competences: INTERROGATOIRE, condition: "Jet d'interrogatoire" }
  ]
};

/** Effets des capacités spéciales, par nom de capacité. */
const CAPACITES = {
  "Évasion": () => [{ type: "desBonus", valeur: 1, condition: "Rompre une immobilisation" }],
  "Imperturbable": () => [{ type: "desBonus", valeur: 1, caracs: ["sangfroid"], condition: "Garder son calme (émeute, interrogatoire, intimidation…)" }],
  "Suceur": () => [
    { type: "desBonus", valeur: 1, condition: "Interaction sociale avec l'administration du LAPD" },
    { type: "desBonus", valeur: -1, condition: "Interaction sociale avec des flics de terrain" }
  ],
  "Ricardo Tubbs spécial": () => [{ type: "relance", competences: ["pilotage"], condition: "Pilotage [bateau]" }],
  "Esprit de ruche": () => [{ type: "desBonus", valeur: 2, caracs: ["perception"], competences: ["instinctDeFlic"], condition: "En combat, avec un équipier doté de l'Esprit de ruche" }],
  "Hyper réactif": () => [{ type: "adrenalineMulti" }],
  "Endurance": () => [{ type: "deBleu", caracs: ["carrure", "sangfroid"], condition: "Jet de résistance (drogue, sommeil…), hors encaissement" }],
  "Solide comme l'acier": () => [{ type: "encaissement" }],
  "Grand maître de la paperasserie": () => [{ type: "deBleu", condition: "Obtenir crédits, matériel ou renforts" }],
  "Regard de flic": () => [{ type: "deBleu", competences: ["instinctDeFlic"] }],
  "Petit génie": () => [{ type: "seuilMin", valeur: 7, competences: ["electronique", "informatique", "mecanique", "sceneDeCrime"] }],
  "Intouchable": () => [{ type: "deBleu", competences: ["corpsACorps"], condition: "Projection" }],
  "Paralysie": () => [{ type: "deBleu", competences: ["corpsACorps", "armeContact"], condition: "Immobilisation" }],
  "Zanshin": () => [{ type: "desBonus", valeur: 2, competences: ["instinctDeFlic"], condition: "Repérer une embuscade" }],
  "Jeremiah Johnson": s => [{ type: "deBleu", competences: ["athletisme", "discretion", "instinctDeFlic", "sceneDeCrime"], condition: `Dans son milieu de prédilection${dom(s)}` }]
};

/** Libellés des types d'effets pour l'interface. */
const LIBELLES = {
  deBleu: "1 dé bleu",
  relance: "relance d'un dé en échec",
  adrenaline: "Adrénaline autorisée",
  adrenalineMulti: "plusieurs points d'Adrénaline par jet",
  seuilMin: "niveau minimal",
  ancienneteDouble: "Ancienneté doublée",
  encaissement: "1 dé bleu en force d'arrêt"
};

export function libelleEffet(e) {
  if (e.type === "desBonus") return `${e.valeur > 0 ? "+" : ""}${e.valeur} dé${Math.abs(e.valeur) > 1 ? "s" : ""}`;
  if (e.type === "seuilMin") return `niveau ${e.valeur}+ minimum`;
  return LIBELLES[e.type] ?? e.type;
}

/** Nombre de stages d'une famille/niveau (optionnellement pour une compétence ciblée). */
function compter(stages, famille, niveau, competence = null) {
  return stages.filter(s => s.system.famille === famille && s.system.niveau === niveau
    && (!competence || !s.system.cible || s.system.cible === competence)).length;
}

/**
 * Analyse les stages d'un personnage.
 * @param {Item[]} items
 */
export function analyserStages(items) {
  const stages = items.filter(i => i.type === "stage");
  const effets = [];
  const capacites = new Set();
  for (const s of stages) {
    const source = s.name;
    const bonus = BONUS[`${s.system.famille}:${s.system.niveau}`];
    if (bonus) for (const e of bonus(s)) effets.push({ ...e, source });
    if (s.system.capacite) {
      capacites.add(s.system.capacite);
      const cap = CAPACITES[s.system.capacite];
      if (cap) for (const e of cap(s)) effets.push({ ...e, source: `${s.system.capacite} (${s.name})` });
    }
  }
  // Un même bonus de stage suivi plusieurs fois ne se cumule pas (sauf indication) : dédoublonnage.
  const vus = new Set();
  const uniques = effets.filter(e => {
    const cle = JSON.stringify({ ...e, source: null });
    if (vus.has(cle)) return false;
    vus.add(cle);
    return true;
  });
  uniques.forEach((e, i) => { e.id = `e${i}`; });

  const nb = (f, n) => compter(stages, f, n);
  return {
    effets: uniques,
    capacites,
    /** « Gonflette » : +3 PV par stage (2 stages au maximum). */
    pv: 3 * Math.min(2, nb("sportif", 1)),
    /** « Rond-de-cuir » : +10 % du salaire de base ; « Petit génie » : +100 $. */
    salairePct: 10 * Math.min(1, nb("rh", 1)),
    salairePrime: capacites.has("Petit génie") ? 100 : 0,
    tirInstinctif: capacites.has("Tir instinctif"),
    tirIncapacitant: capacites.has("Tir incapacitant"),
    sniper: capacites.has("Sniper"),
    rafaleMaitrisee: capacites.has("Rafale maîtrisée"),
    pointFaible: capacites.has("Point faible"),
    /** Bonus d'attaque selon l'arme utilisée. */
    bonusArme(arme) {
      const comp = arme.system.competence;
      let degats = 0, loc = 0, cumul = false;
      const sources = [];
      if (ARMES_A_FEU.includes(comp)) {
        degats += Math.min(3, compter(stages, "tir", 1, comp));
        loc += Math.min(3, compter(stages, "tir", 2, comp));
        cumul = compter(stages, "tir", 3, comp) > 0;
        if (degats || loc) sources.push("Tir");
      }
      if (comp === "armeContact") {
        const foules = Math.min(3, nb("foules", 1));
        if (foules) sources.push("Gestion des foules");
        degats += foules;
        if (/tonfa/i.test(arme.name)) {
          const tonfa = Math.min(3, nb("tonfa", 1));
          if (tonfa) sources.push("Tonfa");
          degats += tonfa;
        }
      }
      return { degats, loc, cumul, sources };
    }
  };
}

/** Bonus d'attaque et bonus permanents par « famille:niveau » ou capacité, pour l'affichage. */
const AUTRES = {
  "tir:1": "+1 dommages au tir, limité par la marge (réparti sur la carte)",
  "tir:2": "±1 localisation au tir, limité par la marge (réparti sur la carte)",
  "tir:3": "dommages et localisation se cumulent sur la même marge",
  "foules:1": "+1 dommages avec une arme de contact, limité par la marge",
  "tonfa:1": "+1 dommages au tonfa, limité par la marge",
  "sportif:1": "+3 PV maximum",
  "rh:1": "+10 % de salaire à la paie",
  "Petit génie": "+100 $ à la paie",
  "Tir instinctif": "initiative minimale −2 et égalités d'initiative gagnées",
  "Tir incapacitant": "option de tir visé bras/jambe (+2 difficulté)",
  "Sniper": "option de tir visé à la localisation choisie (+2 difficulté)",
  "Rafale maîtrisée": "option de rafale dans une seule localisation",
  "Point faible": "bouton « Point faible » sur la carte (2 points de marge)"
};

/** Description lisible de ce qui est automatisé pour un stage. */
export function decrireEffetsStage(item) {
  const lignes = [];
  const cle = `${item.system.famille}:${item.system.niveau}`;
  if (AUTRES[cle]) lignes.push(AUTRES[cle]);
  if (AUTRES[item.system.capacite]) lignes.push(AUTRES[item.system.capacite]);
  for (const e of analyserStages([item]).effets) {
    const cibles = [
      ...(e.competences ?? []).map(k => COPS.competences[k]?.label ?? k),
      ...(e.caracs ?? []).map(k => COPS.caracteristiques[k] ?? k)
    ];
    const sur = cibles.length ? ` sur ${cibles.join(", ")}` : "";
    lignes.push(`${libelleEffet(e)}${sur}${e.condition ? ` (case à cocher : ${e.condition})` : " (automatique)"}`);
  }
  return lignes;
}

/** Un effet s'applique-t-il à ce jet ? */
export function effetConcerne(e, { carac, competence }) {
  if (!e.competences && !e.caracs) return true;
  return !!(e.competences?.includes(competence) || e.caracs?.includes(carac));
}

/** Effets automatiques et optionnels pour un jet donné. */
export function effetsPourJet(analyse, jet) {
  const types = ["deBleu", "desBonus", "relance"];
  const concernes = analyse.effets.filter(e => types.includes(e.type) && effetConcerne(e, jet));
  return {
    auto: concernes.filter(e => !e.condition),
    optionnels: concernes.filter(e => e.condition)
  };
}
