/**
 * Prérequis des stages : mise en forme et vérification.
 * Aucune dépendance à Foundry : ce module est aussi utilisé par tools/build-packs.mjs.
 *
 * Format de `requis` :
 *   caracs       { carrure: 3 }                     caractéristique minimale
 *   competences  { conduite: 6 } ou { conduite: [6, "voiture"] }   niveau 6+ ou mieux (spécialisation facultative,
 *                                                    plusieurs possibles séparées par « | »)
 *   options      [{ caracs, competences }, …]       au moins une option doit être remplie
 *   stages       ["tir:1"]                          stage de la même famille, de ce niveau ou plus
 *   points       { anciennete: 1, adrenaline: 1 }
 *   autre        "…"                                 condition à valider par le MJ
 */
import { COPS } from "./config.mjs";

/** Nom lisible des familles de stages (utilisé pour les stages requis). */
export const FAMILLES_STAGES = {
  animal: "Adaptation au comportement animal",
  artMartial: "Art martial",
  cohesion: "Cohésion",
  combatLocalite: "Combat de localité",
  commando: "Commando",
  communication: "Communication médiatique",
  conduite: "Conduite",
  criminalistique: "Criminalistique",
  dea: "DEA",
  foules: "Gestion des foules",
  frappe: "Frappe",
  geopolitique: "Géopolitique globale",
  infiltration: "Infiltration",
  interrogatoire: "Technique d'interrogatoire",
  linguistique: "Multiplicités linguistiques",
  menottage: "Menottage",
  nadiv: "NADIV",
  navigation: "Navigation",
  negociation: "Négociation",
  partenariat: "Partenariat",
  procedures: "Procédures de communication du LAPD",
  protection: "Protection des personnalités",
  psychologie: "Psychologie criminelle",
  rh: "Ressources humaines",
  sensibilisation: "Sensibilisation culturelle",
  sportExtreme: "Sport extrême",
  sportif: "Sportif",
  survie: "Survie",
  tir: "Tir",
  tonfa: "Tonfa"
};

const labelCarac = k => COPS.caracteristiques[k] ?? k;
const labelComp = k => COPS.competences[k]?.label ?? k;

function texteCompetence(key, val) {
  const [niveau, spe] = Array.isArray(val) ? val : [val, null];
  const speTxt = spe ? ` [${spe.split("|").join(" ou ")}]` : "";
  return `${labelComp(key)}${speTxt} ${niveau}+`;
}

function texteGroupe({ caracs = {}, competences = {} } = {}) {
  return [
    ...Object.entries(caracs).map(([k, v]) => `${labelCarac(k)} ${v}`),
    ...Object.entries(competences).map(([k, v]) => texteCompetence(k, v))
  ].join(", ");
}

/** Texte lisible des prérequis. */
export function formaterRequis(requis = {}) {
  const parties = [];
  for (const s of requis.stages ?? []) {
    const [famille, niveau] = s.split(":");
    parties.push(`stage ${FAMILLES_STAGES[famille] ?? famille} niveau ${niveau}`);
  }
  const groupe = texteGroupe(requis);
  if (groupe) parties.push(groupe);
  if (requis.options?.length) parties.push(requis.options.map(texteGroupe).join(" ou "));
  if (requis.points?.anciennete) parties.push(`${requis.points.anciennete} point d'Ancienneté`);
  if (requis.points?.adrenaline) parties.push(`${requis.points.adrenaline} point d'Adrénaline`);
  if (requis.autre) parties.push(requis.autre);
  return parties.join(" ; ") || "aucun";
}

/** Profil simplifié d'un acteur pour la vérification des prérequis. */
export function profilActeur(actor) {
  const sys = actor.system;
  return {
    caracs: { ...sys.caracteristiques },
    competences: Object.fromEntries(Object.entries(sys.competences).map(([k, c]) => [k, { valeur: c.valeur, specialisation: c.specialisation }])),
    anciennete: sys.anciennete.value,
    adrenaline: sys.adrenaline.value,
    stages: actor.items.filter(i => i.type === "stage").map(i => ({ famille: i.system.famille, niveau: i.system.niveau }))
  };
}

function verifierGroupe({ caracs = {}, competences = {} } = {}, profil, manques, aVerifier) {
  for (const [k, min] of Object.entries(caracs)) {
    if ((profil.caracs[k] ?? 0) < min) manques.push(`${labelCarac(k)} ${min}`);
  }
  for (const [k, val] of Object.entries(competences)) {
    const [seuil, spe] = Array.isArray(val) ? val : [val, null];
    const c = profil.competences[k] ?? { valeur: 0, specialisation: "" };
    if (!c.valeur || c.valeur > seuil) {
      manques.push(texteCompetence(k, val));
      continue;
    }
    if (spe) {
      const attendues = spe.toLowerCase().split("|");
      const actuelle = (c.specialisation ?? "").toLowerCase();
      if (!attendues.some(a => actuelle.includes(a.slice(0, 5)))) aVerifier.push(`spécialisation ${texteCompetence(k, val)}`);
    }
  }
}

/**
 * Vérifie les prérequis d'un stage.
 * @returns {{ok: boolean, manques: string[], aVerifier: string[]}}
 */
export function verifierRequis(requis = {}, profil) {
  const manques = [];
  const aVerifier = [];
  verifierGroupe(requis, profil, manques, aVerifier);

  if (requis.options?.length) {
    const resultats = requis.options.map(opt => {
      const m = [], v = [];
      verifierGroupe(opt, profil, m, v);
      return { m, v };
    });
    const valide = resultats.find(r => !r.m.length);
    if (valide) aVerifier.push(...valide.v);
    else manques.push(`une option parmi : ${requis.options.map(texteGroupe).join(" ou ")}`);
  }

  for (const s of requis.stages ?? []) {
    const [famille, niveau] = s.split(":");
    if (!profil.stages.some(st => st.famille === famille && st.niveau >= Number(niveau))) {
      manques.push(`stage ${FAMILLES_STAGES[famille] ?? famille} niveau ${niveau}`);
    }
  }
  if ((requis.points?.anciennete ?? 0) > profil.anciennete) manques.push(`${requis.points.anciennete} point d'Ancienneté`);
  if ((requis.points?.adrenaline ?? 0) > profil.adrenaline) manques.push(`${requis.points.adrenaline} point d'Adrénaline`);
  if (requis.autre) aVerifier.push(requis.autre);

  return { ok: manques.length === 0, manques, aVerifier };
}
