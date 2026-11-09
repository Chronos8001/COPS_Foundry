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

/** Coût d'un stage en points de stage selon son niveau. */
COPS.coutStage = { 1: 1, 2: 2, 3: 4 };

/* ------------------------------------------------------------------ */
/*  Création de personnage (livre de base, chapitre III, p. 116-127)   */
/* ------------------------------------------------------------------ */

COPS.creation = {
  pointsCaracs: 21,
  caracMin: 2,
  caracMax: 5,
  /** Un seul 5 autorisé à la création. */
  maxCaracsAuMax: 1,

  /** Compétences de départ d'un membre du COPS (niveau = seuil). */
  competencesDepart: {
    armeEpaule: 8, armeContact: 8, armePoing: 7, athletisme: 7, bureaucratie: 8, conduite: 7,
    corpsACorps: 7, discretion: 7, informatique: 7, instinctDeFlic: 9, premiersSecours: 8, sceneDeCrime: 7
  },
  specialisationsDepart: { conduite: "voiture", corpsACorps: "coups" },
  /** Une de ces compétences au choix, au niveau 7+. */
  choixSocial: ["eloquence", "intimidation", "rhetorique"],
  niveauChoixSocial: 7,

  /**
   * 10 points : -1 niveau d'une compétence de départ = 1 point (2 niveaux max par compétence,
   * 5 points max en baisses) ; nouvelle compétence à 9+ = 1 point, à 8+ = 2 points.
   */
  pointsCompetences: 10,
  baisseMaxParCompetence: 2,
  baisseMaxTotale: 5,
  coutNouvelle: { 9: 1, 8: 2 },

  /** Points d'études : jamais en dessous de 5+ à la création. */
  pointsEtudes: 2,
  niveauMinEtudes: 5,

  /** Tout cops débute Détective, échelon I, rang 2 (grille des salaires p. 59). */
  grade: "Détective (échelon I, rang 2)",
  salaire: 1500,

  nbStages: 2,

  origines: {
    ghetto: {
      label: "Enfant du ghetto",
      relation: "Relation de niveau 2 : gang, organisme social ou petit commerce de quartier",
      options: {
        ruger: { label: "Un Ruger Falcon 041 au passé inconnu", objets: [{ pack: "armes", nom: "Ruger Falcon 041" }] },
        liquide: { label: "10 000 $ en billets usagés d'origine douteuse", argent: 10000 },
        grenades: { label: "Trois grenades incendiaires", objets: [{ pack: "armes", nom: "Grenade incendiaire", suffixe: " (×3)" }] },
        law: { label: "Un lance-roquettes jetable (LAW)", objets: [{ pack: "armes", nom: "LAW" }] }
      }
    },
    ouvrier: {
      label: "Fils d'ouvrier",
      relation: "Relation de niveau 2 : syndicat, organisme social ou petit commerce de quartier",
      options: {
        box: { label: "Un box absent du cadastre (logement sans loyer)" },
        desert: { label: "Un coin de désert avec un vieux mobile home" },
        voiture: {
          label: "Une vieille Oldsmobile 440 « Deluxe » préparée par un fou de F1",
          objets: [{ nouveau: "Oldsmobile 440 « Deluxe » (préparée)", description: "Vieille voiture d'apparence pourrie, capable de semer les intercepteurs de la police de la route." }]
        }
      }
    },
    papa: {
      label: "Fils à papa",
      relation: "Relation de niveau 2 : parti politique, grosse entreprise ou administration",
      options: {
        appartement: { label: "Un appartement (propriétaire) dans un quartier aisé" },
        vehicule: {
          label: "Un véhicule très haut de gamme",
          objets: [{ nouveau: "Véhicule haut de gamme", description: "Voiture, moto ou camion de luxe (BMW M8 « GranTurismo » par exemple)." }]
        },
        actions: { label: "Un portefeuille d'actions (+20 % du salaire chaque mois)", revenusPctSalaire: 0.2 },
        clonage: { label: "Un contrat de clonage (greffe d'organes ou de membres)" }
      }
    },
    riche: {
      label: "Gosse de riches",
      relation: "Relation de niveau 2 : parti politique, milieu branché (mode, showbiz…) ou finance",
      options: {
        vehicule: {
          label: "Un véhicule de rêve (Ferrari, Rolls Royce, Porsche…)",
          objets: [{ nouveau: "Véhicule de luxe", description: "Voiture de collection très convoitée par les voleurs." }]
        },
        appartement: { label: "Un immense appartement ou une maison (propriétaire) dans les beaux quartiers" },
        rente: { label: "10 000 $ de revenus mensuels annexes", revenus: 10000 },
        poule: {
          label: "Un(e) compagnon/compagne fortuné(e) : 5 000 à 7 000 $ par mois",
          revenusAleatoires: [5000, 6000, 7000],
          relationSup: "Relation de niveau 4 : votre compagnon/compagne (mannequin, star…)"
        }
      }
    },
    exotique: {
      label: "Exotique",
      relation: "Relation de niveau 2 liée à l'origine (à définir avec le MJ)",
      options: {
        objet: { label: "Un objet lié à l'origine (à définir avec le MJ)" }
      }
    }
  },

  etudes: {
    rue: {
      label: "La rue",
      relation: "Relation de niveau 1 : gang, organisme social ou commerce de quartier (ou +1 à une relation existante)",
      competences: ["armeContact", "armePoing", "athletisme", "mecanique"]
    },
    minimale: {
      label: "Éducation minimale",
      relation: "Relation de niveau 1 : administration, association ou commerce de quartier (ou +1 à une relation existante)",
      competences: ["athletisme", "conduite", "connaissance", "corpsACorps"]
    },
    lycee: {
      label: "Lycée",
      relation: "Relation de niveau 1 : avocat, journaliste ou membre d'une administration (ou +1 à une relation existante)",
      competences: ["athletisme", "connaissance", "informatique", "rhetorique"]
    },
    superieures: {
      label: "Études supérieures",
      relation: "Relation de niveau 1 : haute finance, cabinet d'avocats ou direction d'un organe de presse (ou +1 à une relation existante)",
      competences: ["connaissance", "electronique", "informatique", "medecine", "psychologie"]
    },
    exotique: {
      label: "Exotique",
      relation: "Relation de niveau 1 (ou +1 à une relation existante)",
      competences: null // au choix du MJ : toutes les compétences
    }
  },

  /** points : couples [Ancienneté, Adrénaline] possibles. */
  entrees: {
    academie: { label: "Académie de police", relation: "2 points de relations : parti politique, cadres ou services du LAPD", points: [[2, 0]] },
    armee: { label: "Armée ou forces spéciales", relation: "2 points de relations : administration, cadres ou services du LAPD", points: [[1, 1]] },
    concours: { label: "Concours ou recrutement de terrain", relation: "2 points de relations : criminels, cadres ou services du LAPD", points: [[1, 1]] },
    federale: { label: "Équivalence fédérale", relation: "2 points de relations : criminels, services du LAPD ou parti politique", points: [[1, 1], [2, 0]] },
    sportif: { label: "Sportif", relation: "2 points de relations : journalistes, finance ou parti politique", points: [[0, 2]] },
    piston: { label: "Piston", relation: "2 points de relations : parti politique, cadres ou services du LAPD", points: [[2, 0]] },
    exotique: { label: "Exotique", relation: "2 points de relations au choix", points: [[2, 0], [1, 1], [0, 2]] }
  },

  relationsSupplementaires: "2 points de relations sans restriction (pas plus de deux relations de niveau 4)",

  /** Dotation standard du COPS (p. 173-174). */
  dotation: [
    { pack: "armures", nom: "Uniforme de COPS", equipee: true },
    { pack: "armures", nom: "Masque de combat" },
    { pack: "armes", nom: "Tonfa" },
    { pack: "equipement", nom: "Casquette COPS" },
    { pack: "equipement", nom: "Rangers" },
    { pack: "equipement", nom: "Ceinture multi-usages" },
    { pack: "equipement", nom: "Menottes métalliques" },
    { pack: "equipement", nom: "Menottes en plastique" },
    { pack: "equipement", nom: "Combiné radio-caméra" },
    { pack: "equipement", nom: "Mag-lite" },
    { pack: "equipement", nom: "Multi-tool" },
    { pack: "equipement", nom: "Plaque de police" },
    { pack: "equipement", nom: "Gants de sécurité" },
    { pack: "equipement", nom: "Lunettes de soleil" }
  ],
  armesDotation: {
    compact: { label: "Compact Uni-031 r (automatique)", objets: [{ pack: "armes", nom: "Compact Uni-031 r" }, { pack: "equipement", nom: "Chargeur supplémentaire" }] },
    colt: { label: "Colt « Afrikaneer » 031.s (revolver)", objets: [{ pack: "armes", nom: "Colt « Afrikaneer » 031.s" }, { pack: "equipement", nom: "Speedloader" }] }
  },
  holsters: ["ceinture, sur la hanche", "ceinture, dans le dos", "sous le bras"],
  /** Matériel prêté si l'une des compétences atteint le niveau indiqué. */
  prets: [
    { pack: "equipement", nom: "Trousse de premiers secours", si: { medecine: 7, premiersSecours: 6 } },
    { pack: "equipement", nom: "Kit de criminalistique", si: { sceneDeCrime: 6 } }
  ]
};

export function localisationDepuisJet(n) {
  for (const [key, loc] of Object.entries(COPS.localisations)) {
    if (n >= loc.min && n <= loc.max) return key;
  }
  return null;
}
