/** Constantes de règles du système COPS. */
export const COPS = {};

COPS.caracteristiques = {
  carrure: "Carrure",
  charme: "Charme",
  coordination: "Coordination",
  education: "Éducation",
  perception: "Perception",
  reflexes: "Réflexes",
  sangfroid: "Sang-froid"
};

/** Caractéristiques « physiques » : subissent le malus d'armure. */
COPS.caracPhysiques = ["carrure", "coordination", "reflexes"];

/**
 * Compétences : caractéristique associée, niveau à partir duquel une spécialisation est requise,
 * liste de spécialisations proposées et utilisation possible de l'adrénaline.
 */
COPS.competences = {
  armeEpaule: { label: "Arme d'épaule", carac: "coordination", spe: 5, specialisations: ["fusil à lunette", "fusil", "fusil à pompe"], adrenaline: true },
  armeContact: { label: "Arme de contact", carac: "reflexes", spe: 6, specialisations: ["couteau", "matraque", "arme exotique"], adrenaline: true },
  armePoing: { label: "Arme de poing", carac: "coordination", spe: null, adrenaline: true },
  armeLourde: { label: "Arme lourde", carac: "carrure", spe: 9, specialisations: ["mitrailleuse", "lance-roquettes", "lance-flammes"], adrenaline: true },
  athletisme: { label: "Athlétisme", carac: "carrure", spe: null, adrenaline: true },
  bureaucratie: { label: "Bureaucratie", carac: "sangfroid", spe: null, adrenaline: false },
  conduite: { label: "Conduite", carac: "coordination", spe: 8, specialisations: ["voiture", "moto", "camion", "chenillé"], adrenaline: true },
  connaissance: { label: "Connaissance", carac: "education", spe: 9, specialisations: [], adrenaline: false },
  corpsACorps: { label: "Corps à corps", carac: "reflexes", spe: 7, specialisations: ["coups", "projections", "immobilisations"], adrenaline: true },
  deguisement: { label: "Déguisement", carac: "perception", spe: null, adrenaline: false },
  discretion: { label: "Discrétion", carac: "coordination", spe: null, adrenaline: false },
  electronique: { label: "Électronique", carac: "education", spe: null, adrenaline: false },
  eloquence: { label: "Éloquence", carac: "charme", spe: null, adrenaline: false },
  falsification: { label: "Falsification", carac: "perception", spe: null, adrenaline: false },
  informatique: { label: "Informatique", carac: "education", spe: 5, specialisations: ["piratage", "programmation"], adrenaline: false },
  instinctDeFlic: { label: "Instinct de flic", carac: "perception", spe: null, adrenaline: false },
  intimidation: { label: "Intimidation", carac: "sangfroid", spe: null, adrenaline: false },
  jeu: { label: "Jeu", carac: "sangfroid", spe: null, adrenaline: false },
  lancer: { label: "Lancer", carac: "coordination", spe: null, adrenaline: true },
  mecanique: { label: "Mécanique", carac: "coordination", spe: null, adrenaline: false },
  medecine: { label: "Médecine", carac: "education", spe: 6, specialisations: ["chirurgie", "pharmacologie", "médecine légale"], adrenaline: false },
  pilotage: { label: "Pilotage", carac: "coordination", spe: 9, specialisations: ["patrouilleur maritime", "hélicoptère", "hovercraft", "avion"], adrenaline: false },
  premiersSecours: { label: "Premiers secours", carac: "coordination", spe: null, adrenaline: false },
  psychologie: { label: "Psychologie", carac: "perception", spe: null, adrenaline: false },
  rhetorique: { label: "Rhétorique", carac: "education", spe: null, adrenaline: false },
  sceneDeCrime: { label: "Scène de crime", carac: "perception", spe: null, adrenaline: false },
  tirEnRafales: { label: "Tir en rafales", carac: "coordination", spe: 7, specialisations: ["arme d'épaule", "arme de poing"], adrenaline: true }
};

/** Niveaux de compétence possibles (seuil de réussite). 0 = non acquise. */
COPS.niveaux = [0, 9, 8, 7, 6, 5, 4, 3, 2].map(v => ({ value: v, label: v ? `${v}+` : "—" }));

// Tableaux (et non objets) pour conserver l'ordre -2 → +2 dans les listes déroulantes.
COPS.attitudes = [
  { value: -2, label: "Planqué (-2)" },
  { value: -1, label: "Prudent (-1)" },
  { value: 0, label: "Normal (0)" },
  { value: 1, label: "Agressif (+1)" },
  { value: 2, label: "Ultra-violent (+2)" }
];

COPS.initiatives = [
  { value: -2, label: "Rapide (-2)" },
  { value: -1, label: "Prompt (-1)" },
  { value: 0, label: "Alerte (0)" },
  { value: 1, label: "Posé (+1)" },
  { value: 2, label: "Circonspect (+2)" }
];

/** Attitude de la cible : modifie la difficulté des tirs (planqué +2 … ultra-violent -2). */
COPS.attitudesCible = COPS.attitudes.map(a => ({ value: a.value, label: a.label }));

/** Initiative minimale autorisée selon les Réflexes. */
COPS.initiativeMin = { 1: 2, 2: 1, 3: 0, 4: -1, 5: -2 };

COPS.categoriesArme = {
  poing: "Arme de poing",
  epaule: "Arme d'épaule",
  lourde: "Arme lourde",
  contact: "Arme de contact",
  lancer: "Arme de lancer / explosif"
};

/** Compétence utilisée par défaut selon la catégorie d'arme. */
COPS.competenceParCategorie = {
  poing: "armePoing",
  epaule: "armeEpaule",
  lourde: "armeLourde",
  contact: "armeContact",
  lancer: "lancer"
};

/** Localisations : intervalle du d10, modificateur (dés de dommages supplémentaires et bonus de FA). */
COPS.localisations = {
  jambes: { label: "Jambes", min: 1, max: 2, mod: 0 },
  abdomen: { label: "Abdomen", min: 3, max: 4, mod: 1 },
  torse: { label: "Torse", min: 5, max: 7, mod: 2 },
  bras: { label: "Bras", min: 8, max: 9, mod: 0 },
  tete: { label: "Tête", min: 10, max: 10, mod: 3 }
};

COPS.distances = {
  boutPortant: { label: "Bout portant (< 2 m)", difficulte: 1, bonusDes: 1 },
  courte: { label: "Courte (< 10 m)", difficulte: 1, bonusDes: 0 },
  moyenne: { label: "Moyenne (portée de l'arme)", difficulte: 2, bonusDes: 0 },
  longue: { label: "Longue (2 × portée)", difficulte: 3, bonusDes: 0 }
};

/** Points d'Adrénaline + Ancienneté ne peuvent dépasser cette valeur. */
COPS.maxPointsAdrAnc = 5;

export function localisationDepuisJet(n) {
  for (const [key, loc] of Object.entries(COPS.localisations)) {
    if (n >= loc.min && n <= loc.max) return key;
  }
  return null;
}
