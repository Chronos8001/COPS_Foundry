/**
 * Données des compendiums, issues des tables du livre de base (p. 162, 167, 168, 172).
 * Les descriptions sont de courtes notes de jeu, pas des extraits du livre.
 */

const ICONES = {
  poing: "icons/svg/target.svg",
  epaule: "icons/svg/target.svg",
  lourde: "icons/svg/explosion.svg",
  contact: "icons/svg/sword.svg",
  lancer: "icons/svg/fire.svg",
  armure: "icons/svg/shield.svg",
  equipement: "icons/svg/item-bag.svg"
};

const COMPETENCE = { poing: "armePoing", epaule: "armeEpaule", lourde: "armeLourde", contact: "armeContact", lancer: "lancer" };

// [nom, catégorie, spécialisation, PR, PU, FA, VRC, portée, VC, CT, munitions, chargement, prix, note]
const ARMES_A_FEU = [
  ["Beretta Fink A021", "poing", "", 0, 2, 1, 0, 15, 4, 1, 8, "c", "600 $", ""],
  ["Black Mamba s-121", "poing", "", -1, 2, 1, 3, 20, 3, 3, 18, "c", "750 $", "Tir en rafales [arme de poing]."],
  ["Calico KM021", "poing", "", 0, 2, 1, 5, 20, 2, 2, 28, "c", "1 500 $", "Tir en rafales [arme de poing]."],
  ["Colt « Afrikaneer » 031.s", "poing", "", 0, 3, 1, 0, 30, 4, 1, 6, "s", "1 850 $**", "Arme de dotation des COPS. Relance les 1 sur les dés de dommages de l'arme. Accepte les munitions spéciales."],
  ["Colt Terminator 031", "poing", "", 0, 3, 1, 3, 20, 2, 3, 24, "c", "1 100 $", "Tir en rafales [arme de poing]."],
  ["Compact Uni-031 r", "poing", "", 0, 3, 1, 0, 30, 3, 2, 12, "c", "2 000 $**", "Arme de dotation des COPS. Relance les 1 sur les dés de dommages de l'arme. Munitions caseless."],
  ["Free Snake S-131", "poing", "", -1, 3, 1, 0, 20, 4, 1, 6, "s", "950 $", ""],
  ["H&K Shark II 131", "poing", "", 1, 3, 1, 0, 30, 3, 2, 9, "c", "1 200 $", ""],
  ["Ruger Falcon 041", "poing", "", 0, 4, 1, 0, 30, 5, 1, 5, "s", "1 000 $", "N'accepte pas les munitions trafiquées."],
  ["S&W Defender d-021", "poing", "", 0, 2, 1, 0, 20, 4, 1, 6, "s", "650 $", "Arme de dotation du LAPD."],
  ["Sony Getaway-121", "poing", "", -1, 2, 1, 0, 15, 6, 1, 4, "b", "800 $", ""],
  ["Benelli 053 Tactical", "epaule", "fusil à pompe", 0, 5, 3, 0, 25, 3, 1, 8, "b", "600 $", "Sans crosse : Précision -1."],
  ["Colt M17-041", "epaule", "fusil", 0, 4, 1, 4, 125, 2, 1, 22, "c", "6 000 $*", "Tir en rafales [arme d'épaule]."],
  ["Hellfire 032fx", "epaule", "fusil", 0, 3, 2, 4, 75, 3, 2, 18, "c", "4 000 $*", "Tir en rafales [arme d'épaule]. Viseur laser : Précision +1 à moins de 10 m. Compensateur : 2 tirs par tour avec -1 dé par tir."],
  ["Ram Striker 031", "epaule", "fusil", 0, 3, 1, 0, 25, 6, 1, 1, "bd", "400 $", "Arbalète silencieuse. 3 tours entre chaque tir."],
  ["Sharp 251LL", "epaule", "fusil à lunette", 2, 5, 1, 0, 600, 6, 1, 6, "c", "10 000 $*", "Sans bipied (2 tours pour l'installer) : Précision -1."],
  ["Smoker 033fx", "epaule", "fusil", 0, 3, 3, 0, 125, 4, 1, 12, "c", "8 000 $*", "Balles choc uniquement. Lance-grenades lacrymogènes (250 m, rayon 5 m)."],
  ["Sony Tsunami -143", "epaule", "fusil à pompe", -1, 4, 3, 3, 40, 3, 1, 20, "c", "8 000 $*", "Tir en rafales [arme d'épaule]."],
  ["Mckiddie 095", "lourde", "lance-roquettes", 0, 9, 5, 0, 100, 0, 1, 4, "b", "30 000 $*", "Tir de couverture impossible."],
  ["Stoner '17 Jungle 042", "lourde", "mitrailleuse", 0, 4, 2, 6, 400, 2, 1, 200, "bd", "15 000 $*", "Uniquement en rafale. Sans bipied calé : Précision -2."],
  ["Beretta 92", "poing", "", 0, 2, 1, 0, 20, 4, 2, 20, "c", "250 $", "Arme ancienne."],
  ["Glock 17", "poing", "", 0, 2, 1, 0, 20, 4, 1, 17, "c", "200 $", "Arme ancienne."],
  ["Mac-11", "poing", "", -1, 3, 1, 3, 30, 3, 1, 16, "c", "350 $", "Arme ancienne."],
  ["Mini-uzi", "poing", "", -1, 2, 1, 3, 20, 3, 1, 20, "c", "400 $", "Arme ancienne."],
  ["Uzi", "poing", "", -1, 3, 1, 3, 40, 3, 1, 25, "c", "500 $", "Arme ancienne."],
  ["AK47", "epaule", "fusil", -1, 3, 1, 3, 75, 3, 1, 30, "c", "850 $*", "Arme ancienne."],
  ["AK74", "epaule", "fusil", 0, 3, 1, 3, 125, 3, 1, 30, "c", "1 200 $*", "Arme ancienne."],
  ["M16", "epaule", "fusil", 0, 3, 1, 3, 100, 3, 1, 20, "c", "1 000 $*", "Arme ancienne."],
  ["LAW", "lourde", "lance-roquettes", -1, 8, 4, 0, 50, 0, 1, 1, "", "5 000 $*", "Arme ancienne, à usage unique."]
];

// [nom, spécialisation, PR, PU, FA, note]
const ARMES_BLANCHES = [
  ["Batte de base-ball", "matraque", -1, 1, 3, ""],
  ["Machette", "machette", 0, 3, 1, ""],
  ["Matraque électrique", "matraque", 0, 1, 5, ""],
  ["Poignard de combat", "couteau", 1, 2, 1, ""],
  ["Rasoir", "couteau", 0, 2, 0, ""],
  ["Taser", "taser", 0, 0, 5, ""],
  ["Tonfa", "matraque", 0, 1, 3, "Arme de corps à corps de base du COPS."],
  ["Tronçonneuse", "tronçonneuse", -2, 5, 1, ""]
];

// [nom, dommages, FA, note]
const EXPLOSIFS = [
  ["Cocktail Molotov", "1d6", 1, "Rayon 1 m, +1d6 par tour pendant 1d6 tours. Explose à l'impact."],
  ["Grenade à fragmentation", "2d6+2", 5, "Rayon 5 m."],
  ["Grenade incendiaire", "2d6", 3, "Rayon 5 m, +1d6 par tour pendant 1d6 tours."],
  ["Grenade fumigène", "", 0, "Rayon 5 m : -2 dés à tout tir traversant le nuage."],
  ["Grenade lacrymogène", "", 0, "Rayon 15 m : jet de Carrure (3) ; la marge d'échec donne le malus en dés pendant (10 − Carrure) minutes."]
];

// [nom, zones, protection, malus, malusPerception, prix]
const ARMURES = [
  ["Blouson en cuir", ["torse", "abdomen", "bras"], "1d6+1", 0, 0, "500 $"],
  ["Casque de moto", ["tete"], "1d6+2", 0, 1, "250 $"],
  ["Casque de SWAT", ["tete"], "2d6+6", 0, 0, "15 000 $*"],
  ["Gilet pare-balles", ["torse", "abdomen"], "2d6+6", 2, 0, "1 000 $"],
  ["Gilet pare-éclats", ["torse", "abdomen"], "1d6+6", 1, 0, "500 $"],
  ["T-shirt pare-balles", ["torse", "abdomen"], "1d6+3", 0, 0, "250 $"],
  ["Pantalon en cuir", ["jambes"], "1d6", 0, 0, "300 $"],
  ["Uniforme de SWAT", ["torse", "abdomen", "bras", "jambes"], "2d6+3", 1, 0, "25 000 $*"],
  ["Bouclier anti-émeutes", ["torse", "abdomen", "bras", "jambes"], "+3", 0, 0, "600 $*"],
  ["Uniforme de COPS", ["torse", "abdomen", "bras", "jambes"], "1d6+6", 0, 0, "35 000 $**"],
  ["Masque de combat", ["tete"], "2d6+6", 0, 1, "30 000 $**"]
];

// [nom, quantité, description]
const EQUIPEMENT = [
  ["Casquette COPS", 1, "Permet d'accrocher le combiné radio-caméra. Aucune protection."],
  ["Rangers", 1, "Semelle épaisse. Aucune protection en combat."],
  ["Ceinture multi-usages", 1, "Poches et passants pour le petit matériel du cops."],
  ["Menottes métalliques", 1, "Briser : jet de Carrure, difficulté 7."],
  ["Menottes en plastique", 10, "Briser : jet de Carrure, difficulté 5."],
  ["Combiné radio-caméra", 1, "300 heures d'autonomie. Transmet image et son au QG."],
  ["Mag-lite", 1, "Peut aveugler : jet de Réflexes (2) sinon -2 dés aux actions physiques pendant 5 tours."],
  ["Multi-tool", 1, "Pince, couteau, tournevis, poinçon…"],
  ["Plaque de police", 1, ""],
  ["Gants de sécurité", 1, ""],
  ["Lunettes de soleil", 1, "Réduit à 1 la difficulté du jet de Réflexes contre l'éblouissement."],
  ["Holster", 1, "Ceinture (hanche ou dos) ou sous le bras : détermine l'initiative minimale pour dégainer."],
  ["Trousse de premiers secours", 1, "+1 dé aux jets de Médecine ou de Premiers secours."],
  ["Kit de criminalistique", 1, "+1 dé aux jets de Scène de crime."],
  ["Chargeur supplémentaire", 2, ""],
  ["Speedloader", 2, ""],
  ["Bottes ferrées", 1, "+1 point de dommages aux coups au corps à corps."],
  ["Poing américain", 1, "+2 points de dommages et +1 FA aux coups au corps à corps."]
];

function description(note) {
  return note ? `<p>${note}</p>` : "";
}

export function armes() {
  const docs = [];
  for (const [name, cat, spe, pr, pu, fa, vrc, portee, vc, ct, mun, charg, prix, note] of ARMES_A_FEU) {
    docs.push({
      name, type: "arme", img: ICONES[cat],
      system: {
        categorie: cat, competence: COMPETENCE[cat], specialisation: spe,
        precision: pr, puissance: pu, forceArret: fa, vrc, portee, vc, cadence: ct,
        munitions: { value: mun, max: mun }, chargement: charg, prix,
        relanceUn: /Relance les 1/.test(note), dommagesSpeciaux: "", equipee: true,
        description: description(note)
      }
    });
  }
  for (const [name, spe, pr, pu, fa, note] of ARMES_BLANCHES) {
    docs.push({
      name, type: "arme", img: ICONES.contact,
      system: {
        categorie: "contact", competence: "armeContact", specialisation: spe,
        precision: pr, puissance: pu, forceArret: fa, vrc: 0, portee: 0, vc: 0, cadence: 1,
        munitions: { value: 0, max: 0 }, chargement: "", prix: "", relanceUn: false,
        dommagesSpeciaux: "", equipee: true, description: description(note)
      }
    });
  }
  for (const [name, dmg, fa, note] of EXPLOSIFS) {
    docs.push({
      name, type: "arme", img: ICONES.lancer,
      system: {
        categorie: "lancer", competence: "lancer", specialisation: "",
        precision: 0, puissance: 0, forceArret: fa, vrc: 0, portee: 0, vc: 0, cadence: 1,
        munitions: { value: 0, max: 0 }, chargement: "", prix: "", relanceUn: false,
        dommagesSpeciaux: dmg, equipee: true,
        description: description(`${note} Lancer : 1 réussite à moins de 5 m, 2 au-delà ; portée max (10 + Carrure) m. Raté : tombe à (1 + marge d'échec) m de la cible.`)
      }
    });
  }
  return docs;
}

export function armures() {
  return ARMURES.map(([name, zones, protection, malus, malusPerception, prix]) => ({
    name, type: "armure", img: ICONES.armure,
    system: {
      protection, malus, malusPerception, prix, equipee: false,
      zones: Object.fromEntries(["tete", "torse", "abdomen", "bras", "jambes"].map(z => [z, zones.includes(z)])),
      description: ""
    }
  }));
}

export function equipement() {
  return EQUIPEMENT.map(([name, quantite, note]) => ({
    name, type: "equipement", img: ICONES.equipement,
    system: { quantite, prix: "", description: description(note) }
  }));
}
