/**
 * Assistant de création d'un cops (livre de base, p. 116-127) :
 * caractéristiques, compétences, historique, stages, dotation, salaire et argent de départ.
 * Le bouton « Tout aléatoire » remplit chaque étape avec un choix valide.
 */
import { COPS } from "../config.mjs";
import { verifierRequis } from "../stages.mjs";
import { CIBLES_STAGES } from "../effets-stages.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

const R = () => COPS.creation;
const CARACS = Object.keys(COPS.caracteristiques);
const COMPETENCES = Object.keys(COPS.competences);
const CONNAISSANCES_ALEATOIRES = ["drogues", "rues de L.A.", "droit", "gangs", "sectes", "histoire"];

const hasard = arr => arr[Math.floor(Math.random() * arr.length)];
const formatDollars = n => `${Number(n).toLocaleString("fr-FR")} $`;
const echapper = s => foundry.utils.escapeHTML?.(String(s)) ?? String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);

/* -------------------------------------------- */
/*  État et calculs (sans DOM)                  */
/* -------------------------------------------- */

function etatInitial() {
  const r = R();
  const choixSocial = r.choixSocial[0];
  return {
    caracs: Object.fromEntries(CARACS.map(k => [k, 3])),
    choixSocial,
    competences: Object.fromEntries(COMPETENCES.map(k => [k, niveauBase(k, choixSocial)])),
    specialisations: { ...r.specialisationsDepart },
    origine: "ghetto",
    origineOption: "ruger",
    revenusAleatoires: null,
    etude: "lycee",
    etudePoints: {},
    entree: "academie",
    entreePoints: 0,
    relationsNotes: "",
    stages: [{ id: "", capacite: "", cible: "" }, { id: "", capacite: "", cible: "" }],
    arme: "compact",
    holster: r.holsters[0],
    argent: null,
    remplacer: true,
    ignorerPrerequis: false
  };
}

/** Niveau de départ d'une compétence (0 si non acquise). */
function niveauBase(key, choixSocial) {
  const r = R();
  if (key === choixSocial) return r.niveauChoixSocial;
  return r.competencesDepart[key] ?? 0;
}

/** Coût (points de création) d'un niveau, ou null s'il est interdit. */
function coutCompetence(key, niveau, choixSocial) {
  const r = R();
  const base = niveauBase(key, choixSocial);
  if (base) {
    const baisse = base - niveau;
    return baisse >= 0 && baisse <= r.baisseMaxParCompetence ? baisse : null;
  }
  if (!niveau) return 0;
  return r.coutNouvelle[niveau] ?? null;
}

function niveauxPossibles(key, choixSocial) {
  const r = R();
  const base = niveauBase(key, choixSocial);
  if (base) return Array.from({ length: r.baisseMaxParCompetence + 1 }, (_, i) => base - i);
  return [0, ...Object.keys(r.coutNouvelle).map(Number).sort((a, b) => b - a)];
}

/** Niveau final après les points d'études. */
function niveauApresEtudes(niveau, points) {
  if (!points) return niveau;
  return niveau ? niveau - points : 10 - points;
}

function competencesEtude(etude) {
  return R().etudes[etude]?.competences ?? COMPETENCES;
}

function couplePoints(etat) {
  const points = R().entrees[etat.entree]?.points ?? [[0, 0]];
  return points[etat.entreePoints] ?? points[0];
}

/** Calcule tout ce qui découle de l'état : personnage final, erreurs, avertissements. */
function calculer(etat, stagesPack) {
  const r = R();
  const erreurs = [];
  const avertissements = [];

  // --- Caractéristiques
  const totalCaracs = CARACS.reduce((s, k) => s + etat.caracs[k], 0);
  if (totalCaracs !== r.pointsCaracs) erreurs.push(`Caractéristiques : ${totalCaracs} points répartis au lieu de ${r.pointsCaracs}.`);
  if (CARACS.some(k => etat.caracs[k] < r.caracMin || etat.caracs[k] > r.caracMax)) {
    erreurs.push(`Caractéristiques : chaque valeur doit être comprise entre ${r.caracMin} et ${r.caracMax}.`);
  }
  if (CARACS.filter(k => etat.caracs[k] === r.caracMax).length > r.maxCaracsAuMax) {
    erreurs.push(`Caractéristiques : une seule peut valoir ${r.caracMax} à la création.`);
  }

  // --- Compétences (10 points)
  let pointsComp = 0, baisses = 0;
  for (const k of COMPETENCES) {
    const cout = coutCompetence(k, etat.competences[k], etat.choixSocial);
    if (cout === null) erreurs.push(`${COPS.competences[k].label} : niveau ${etat.competences[k]}+ impossible à la création.`);
    else {
      pointsComp += cout;
      if (niveauBase(k, etat.choixSocial)) baisses += cout;
    }
  }
  if (pointsComp > r.pointsCompetences) erreurs.push(`Compétences : ${pointsComp} points dépensés sur ${r.pointsCompetences}.`);
  else if (pointsComp < r.pointsCompetences) avertissements.push(`Compétences : ${r.pointsCompetences - pointsComp} point(s) non dépensé(s).`);
  if (baisses > r.baisseMaxTotale) erreurs.push(`Compétences : ${baisses} points pour améliorer les compétences de départ (${r.baisseMaxTotale} au maximum).`);

  // --- Études (2 points)
  const listeEtude = competencesEtude(etat.etude);
  let pointsEtudes = 0;
  const competencesFinales = {};
  for (const k of COMPETENCES) {
    const p = listeEtude.includes(k) ? (etat.etudePoints[k] ?? 0) : 0;
    pointsEtudes += p;
    const final = niveauApresEtudes(etat.competences[k], p);
    if (p && final < r.niveauMinEtudes) erreurs.push(`Études : ${COPS.competences[k].label} ne peut pas dépasser ${r.niveauMinEtudes}+ à la création.`);
    competencesFinales[k] = final;
  }
  if (pointsEtudes > r.pointsEtudes) erreurs.push(`Études : ${pointsEtudes} points utilisés sur ${r.pointsEtudes}.`);
  else if (pointsEtudes < r.pointsEtudes) avertissements.push(`Études : ${r.pointsEtudes - pointsEtudes} point(s) non utilisé(s).`);

  // --- Spécialisations
  const specialisations = {};
  for (const k of COMPETENCES) {
    const cfg = COPS.competences[k];
    const niv = competencesFinales[k];
    const requise = !!(cfg.spe && niv && niv <= cfg.spe);
    specialisations[k] = { requise, valeur: etat.specialisations[k] ?? "" };
    if (requise && !specialisations[k].valeur.trim()) erreurs.push(`${cfg.label} ${niv}+ : choisissez une spécialisation.`);
  }

  // --- Entrée au COPS
  const [anciennete, adrenaline] = couplePoints(etat);

  // --- Profil pour les prérequis (avant les stages)
  const profil = {
    caracs: { ...etat.caracs },
    competences: Object.fromEntries(COMPETENCES.map(k => [k, { valeur: competencesFinales[k], specialisation: specialisations[k].valeur }])),
    anciennete, adrenaline, stages: []
  };

  // --- Stages
  const niveau1 = stagesPack.filter(s => s.system.niveau === 1);
  const verifs = new Map(niveau1.map(s => [s.id, verifierRequis(s.system.requis, profil)]));
  const stagesChoisis = etat.stages.map((choix, i) => {
    const doc = niveau1.find(s => s.id === choix.id) ?? null;
    const verif = doc ? verifs.get(doc.id) : null;
    // Une capacité unique est choisie d'office.
    const capacite = choix.capacite || (doc?.system.capacites.length === 1 ? doc.system.capacites[0] : "");
    if (!doc) erreurs.push(`Stage ${i + 1} : aucun stage choisi.`);
    else {
      if (!verif.ok) {
        const msg = `Stage « ${doc.name} » : prérequis non remplis (${verif.manques.join(", ")}).`;
        if (etat.ignorerPrerequis) avertissements.push(msg);
        else erreurs.push(msg);
      }
      if (verif.aVerifier.length) avertissements.push(`Stage « ${doc.name} » : à vérifier avec le MJ (${verif.aVerifier.join(" ; ")}).`);
      if (doc.system.capacites.length && !doc.system.capacites.includes(capacite)) {
        erreurs.push(`Stage « ${doc.name} » : choisissez une capacité spéciale.`);
      }
    }
    return { doc, verif, capacite, cible: choix.cible ?? "" };
  });
  const [a, b] = stagesChoisis;
  if (a.doc && b.doc && a.doc.id === b.doc.id) {
    if (!a.doc.system.cumulable) erreurs.push(`Stage « ${a.doc.name} » : ne peut pas être suivi deux fois.`);
    else if (a.capacite && a.capacite === b.capacite && a.doc.system.capacites.length > 1) {
      erreurs.push(`Stage « ${a.doc.name} » : la même capacité ne peut pas être choisie deux fois.`);
    }
  }
  const nbStage = famille => stagesChoisis.filter(s => s.doc?.system.famille === famille).length;

  // --- Points de vie
  const pvBonus = 3 * Math.min(2, nbStage("sportif"));
  const pvMax = 20 + etat.caracs.carrure * 3 + pvBonus;

  // --- Origine et finances
  const origine = r.origines[etat.origine];
  const option = origine?.options[etat.origineOption] ?? Object.values(origine?.options ?? {})[0];
  const salaire = Math.round(r.salaire * (1 + 0.1 * nbStage("rh")));
  let revenus = 0;
  if (option?.revenus) revenus = option.revenus;
  if (option?.revenusPctSalaire) revenus = Math.round(salaire * option.revenusPctSalaire);
  if (option?.revenusAleatoires) revenus = etat.revenusAleatoires ?? option.revenusAleatoires[0];
  const argentAuto = salaire + (option?.argent ?? 0);
  const argent = etat.argent ?? argentAuto;

  // --- Équipement
  const arme = r.armesDotation[etat.arme] ?? Object.values(r.armesDotation)[0];
  const objets = [
    ...r.dotation,
    ...arme.objets,
    { pack: "equipement", nom: "Holster", suffixe: ` (${etat.holster})` },
    ...r.prets.filter(p => Object.entries(p.si).some(([k, seuil]) => competencesFinales[k] && competencesFinales[k] <= seuil))
      .map(p => ({ ...p, suffixe: " (prêt du LAPD)" })),
    ...(option?.objets ?? [])
  ];

  // --- Relations
  const etude = r.etudes[etat.etude];
  const entree = r.entrees[etat.entree];
  const relations = [
    `Origine (${origine.label}) : ${origine.relation}`,
    option?.relationSup ? `Origine : ${option.relationSup}` : null,
    `Études (${etude.label}) : ${etude.relation}`,
    `Entrée au COPS (${entree.label}) : ${entree.relation}`,
    `Relations supplémentaires : ${r.relationsSupplementaires}`
  ].filter(Boolean);

  return {
    erreurs, avertissements, totalCaracs, pointsComp, baisses, pointsEtudes, competencesFinales, specialisations,
    anciennete, adrenaline, profil, verifs, niveau1, stagesChoisis, pvBonus, pvMax,
    origine, option, salaire, revenus, argent, argentAuto, arme, objets, relations, etude, entree
  };
}

/* -------------------------------------------- */
/*  Tirage aléatoire                            */
/* -------------------------------------------- */

function caracsAleatoires() {
  const r = R();
  const caracs = Object.fromEntries(CARACS.map(k => [k, r.caracMin]));
  let reste = r.pointsCaracs - r.caracMin * CARACS.length;
  while (reste > 0) {
    const auMax = CARACS.filter(k => caracs[k] === r.caracMax).length;
    const candidats = CARACS.filter(k => caracs[k] < r.caracMax - 1 || (caracs[k] === r.caracMax - 1 && auMax < r.maxCaracsAuMax));
    caracs[hasard(candidats)]++;
    reste--;
  }
  return caracs;
}

function competencesAleatoires(etat) {
  const r = R();
  const comp = Object.fromEntries(COMPETENCES.map(k => [k, niveauBase(k, etat.choixSocial)]));
  let budget = r.pointsCompetences, baisses = 0;
  // Les compétences liées aux meilleures caractéristiques sont favorisées.
  const poids = k => etat.caracs[COPS.competences[k].carac] ** 2;
  for (let essais = 0; budget > 0 && essais < 200; essais++) {
    const actions = [];
    for (const k of COMPETENCES) {
      const base = niveauBase(k, etat.choixSocial);
      const niv = comp[k];
      if (base) {
        if (baisses < r.baisseMaxTotale && base - niv < r.baisseMaxParCompetence) actions.push([k, niv - 1, true]);
      } else if (niv === 0) actions.push([k, 9, false]);
      else if (niv === 9) actions.push([k, 8, false]);
    }
    if (!actions.length) break;
    const total = actions.reduce((s, [k]) => s + poids(k), 0);
    let tirage = Math.random() * total;
    const [k, niveau, estBaisse] = actions.find(([key]) => (tirage -= poids(key)) <= 0) ?? actions[0];
    comp[k] = niveau;
    budget--;
    if (estBaisse) baisses++;
  }
  return comp;
}

function etudesAleatoires(etat) {
  const r = R();
  const liste = competencesEtude(etat.etude);
  const points = {};
  for (let i = 0, essais = 0; i < r.pointsEtudes && essais < 50; essais++) {
    const k = hasard(liste);
    const p = (points[k] ?? 0) + 1;
    if (niveauApresEtudes(etat.competences[k], p) < r.niveauMinEtudes) continue;
    points[k] = p;
    i++;
  }
  return points;
}

function specialisationsAleatoires(etat, calc) {
  const spe = { ...etat.specialisations };
  for (const k of COMPETENCES) {
    if (!calc.specialisations[k].requise || spe[k]?.trim()) continue;
    const liste = COPS.competences[k].specialisations?.length ? COPS.competences[k].specialisations : CONNAISSANCES_ALEATOIRES;
    spe[k] = hasard(liste);
  }
  return spe;
}

/* -------------------------------------------- */
/*  Application                                 */
/* -------------------------------------------- */

export class CreationCops extends HandlebarsApplicationMixin(ApplicationV2) {
  constructor(actor, options = {}) {
    super(options);
    this.actor = actor;
    this.etat = etatInitial();
    this.stagesPack = null;
  }

  static DEFAULT_OPTIONS = {
    classes: ["cops", "creation-cops"],
    tag: "div",
    window: { title: "Création de cops", icon: "fa-solid fa-id-card", resizable: true },
    position: { width: 880, height: 820 },
    actions: {
      aleatoire: CreationCops.#onAleatoire,
      caracsAleatoires: CreationCops.#onCaracsAleatoires,
      competencesAleatoires: CreationCops.#onCompetencesAleatoires,
      reinitialiser: CreationCops.#onReinitialiser,
      creer: CreationCops.#onCreer
    }
  };

  static PARTS = {
    main: { template: "systems/cops/templates/apps/creation.hbs", scrollable: [".creation-corps"] }
  };

  get title() {
    return `Création de cops : ${this.actor.name}`;
  }

  /** Charge les stages du compendium (une seule fois). */
  async #chargerStages() {
    if (this.stagesPack) return this.stagesPack;
    const pack = game.packs.get("cops.stages");
    if (!pack) {
      ui.notifications.warn("Compendium « Stages » introuvable : lancez « npm run build:packs ».");
      this.stagesPack = [];
    } else {
      const docs = await pack.getDocuments();
      this.stagesPack = docs.sort((a, b) => a.name.localeCompare(b.name, "fr"));
    }
    return this.stagesPack;
  }

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    const stagesPack = await this.#chargerStages();
    const etat = this.etat;
    const r = R();
    const calc = calculer(etat, stagesPack);
    const options_ = (obj, sel, lab = v => v.label) => Object.entries(obj).map(([value, v]) => ({ value, label: lab(v), selected: value === sel }));
    const listeEtude = competencesEtude(etat.etude);

    return Object.assign(context, {
      etat, r, calc,
      caracs: CARACS.map(k => ({ key: k, label: COPS.caracteristiques[k], valeur: etat.caracs[k] })),
      choixSocial: r.choixSocial.map(k => ({ value: k, label: COPS.competences[k].label, selected: k === etat.choixSocial })),
      competences: COMPETENCES.map(k => {
        const cfg = COPS.competences[k];
        const base = niveauBase(k, etat.choixSocial);
        const final = calc.competencesFinales[k];
        return {
          key: k, label: cfg.label,
          carac: COPS.caracteristiques[cfg.carac].slice(0, 4) + ".",
          base: base ? `${base}+` : "—",
          niveaux: niveauxPossibles(k, etat.choixSocial).map(n => {
            const cout = coutCompetence(k, n, etat.choixSocial);
            return { value: n, label: `${n ? `${n}+` : "—"}${cout ? ` (${cout} pt${cout > 1 ? "s" : ""})` : ""}`, selected: n === etat.competences[k] };
          }),
          final: final ? `${final}+` : "—",
          modifieeParEtudes: final !== etat.competences[k],
          speRequise: calc.specialisations[k].requise,
          specialisation: calc.specialisations[k].valeur,
          suggestions: cfg.specialisations ?? []
        };
      }),
      origines: options_(r.origines, etat.origine),
      origineOptions: options_(calc.origine.options, etat.origineOption),
      etudes: options_(r.etudes, etat.etude),
      etudeCompetences: listeEtude.map(k => ({
        key: k, label: COPS.competences[k].label,
        niveau: etat.competences[k] ? `${etat.competences[k]}+` : "—",
        points: [0, 1, 2].map(p => ({ value: p, label: String(p), selected: p === (etat.etudePoints[k] ?? 0) }))
      })),
      entrees: options_(r.entrees, etat.entree),
      entreePoints: (calc.entree.points ?? []).map(([anc, adr], i) => ({
        value: i, label: `${anc} Ancienneté / ${adr} Adrénaline`, selected: i === etat.entreePoints
      })),
      stages: etat.stages.map((choix, i) => {
        const sel = calc.stagesChoisis[i];
        return {
          index: i,
          options: calc.niveau1.map(s => {
            const v = calc.verifs.get(s.id);
            return { value: s.id, label: `${v.ok ? "✔" : "✘"} ${s.name}`, selected: s.id === choix.id, disabled: !v.ok && !etat.ignorerPrerequis };
          }),
          doc: sel.doc,
          verif: sel.verif,
          capacites: (sel.doc?.system.capacites ?? []).map(c => ({ value: c, label: c, selected: c === sel.capacite })),
          cibles: (CIBLES_STAGES[sel.doc?.system.famille] ?? []).map(k => ({ value: k, label: COPS.competences[k].label, selected: k === choix.cible })),
          cible: choix.cible ?? "",
          description: sel.doc?.system.description ?? ""
        };
      }),
      armes: options_(r.armesDotation, etat.arme),
      holsters: r.holsters.map(h => ({ value: h, label: h, selected: h === etat.holster })),
      objets: calc.objets.map(o => `${o.nouveau ?? o.nom}${o.suffixe ?? ""}`),
      salaire: formatDollars(calc.salaire),
      revenus: formatDollars(calc.revenus),
      argentAuto: formatDollars(calc.argentAuto),
      aDesObjets: this.actor.items.size > 0
    });
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    for (const el of this.element.querySelectorAll("[data-champ]")) {
      el.addEventListener("change", ev => this.#onChange(ev));
    }
  }

  /** Met à jour l'état depuis un champ, avec quelques remises à zéro en cascade. */
  #onChange(event) {
    const el = event.currentTarget;
    const chemin = el.dataset.champ;
    let valeur = el.type === "checkbox" ? el.checked : el.value;
    if (el.dataset.type === "number") valeur = valeur === "" ? null : Number(valeur);
    const etat = this.etat;
    const r = R();

    if (chemin === "choixSocial") {
      const ancien = etat.choixSocial;
      etat.choixSocial = valeur;
      etat.competences[ancien] = 0;
      etat.competences[valeur] = r.niveauChoixSocial;
    } else if (chemin === "origine") {
      etat.origine = valeur;
      etat.origineOption = Object.keys(r.origines[valeur].options)[0];
      etat.revenusAleatoires = null;
    } else if (chemin === "origineOption") {
      etat.origineOption = valeur;
      const opt = r.origines[etat.origine].options[valeur];
      etat.revenusAleatoires = opt?.revenusAleatoires ? hasard(opt.revenusAleatoires) : null;
    } else if (chemin === "etude") {
      etat.etude = valeur;
      etat.etudePoints = {};
    } else if (chemin === "entree") {
      etat.entree = valeur;
      etat.entreePoints = 0;
    } else if (/^stages\.\d\.id$/.test(chemin)) {
      foundry.utils.setProperty(etat, chemin, valeur);
      foundry.utils.setProperty(etat, chemin.replace(".id", ".capacite"), "");
      foundry.utils.setProperty(etat, chemin.replace(".id", ".cible"), "");
    } else {
      foundry.utils.setProperty(etat, chemin, valeur);
    }
    this.render();
  }

  /* --------- Actions --------- */

  static #onCaracsAleatoires() {
    this.etat.caracs = caracsAleatoires();
    this.render();
  }

  static #onCompetencesAleatoires() {
    this.etat.competences = competencesAleatoires(this.etat);
    this.etat.etudePoints = etudesAleatoires(this.etat);
    this.etat.specialisations = specialisationsAleatoires(this.etat, calculer(this.etat, this.stagesPack ?? []));
    this.render();
  }

  static #onReinitialiser() {
    this.etat = etatInitial();
    this.render();
  }

  static async #onAleatoire() {
    const r = R();
    const stagesPack = await this.#chargerStages();
    // Plusieurs essais pour obtenir deux stages accessibles.
    for (let essai = 0; essai < 20; essai++) {
      const etat = etatInitial();
      etat.caracs = caracsAleatoires();
      etat.choixSocial = hasard(r.choixSocial);
      etat.origine = hasard(Object.keys(r.origines));
      etat.origineOption = hasard(Object.keys(r.origines[etat.origine].options));
      const opt = r.origines[etat.origine].options[etat.origineOption];
      etat.revenusAleatoires = opt.revenusAleatoires ? hasard(opt.revenusAleatoires) : null;
      etat.etude = hasard(Object.keys(r.etudes).filter(e => e !== "exotique"));
      etat.entree = hasard(Object.keys(r.entrees).filter(e => e !== "exotique"));
      etat.entreePoints = Math.floor(Math.random() * r.entrees[etat.entree].points.length);
      etat.competences = competencesAleatoires(etat);
      etat.etudePoints = etudesAleatoires(etat);
      etat.specialisations = specialisationsAleatoires(etat, calculer(etat, stagesPack));
      etat.arme = hasard(Object.keys(r.armesDotation));
      etat.holster = hasard(r.holsters);

      const calc = calculer(etat, stagesPack);
      const accessibles = calc.niveau1.filter(s => {
        const v = calc.verifs.get(s.id);
        return v.ok && !s.system.requis?.autre;
      });
      if (accessibles.length < r.nbStages && essai < 19) continue;
      const choisis = [];
      for (const s of [...accessibles].sort(() => Math.random() - 0.5)) {
        if (choisis.length >= r.nbStages) break;
        choisis.push(s);
      }
      etat.stages = etat.stages.map((_, i) => {
        const s = choisis[i];
        const cibles = CIBLES_STAGES[s?.system.famille] ?? [];
        // Compétence visée : la meilleure compétence acquise parmi les choix possibles.
        const cible = cibles.filter(k => calc.competencesFinales[k]).sort((x, y) => calc.competencesFinales[x] - calc.competencesFinales[y])[0] ?? "";
        return { id: s?.id ?? "", capacite: s?.system.capacites.length ? hasard(s.system.capacites) : "", cible };
      });
      etat.remplacer = this.etat.remplacer;
      this.etat = etat;
      break;
    }
    this.render();
  }

  static async #onCreer() {
    const calc = calculer(this.etat, await this.#chargerStages());
    if (calc.erreurs.length) {
      ui.notifications.error(`Création impossible : ${calc.erreurs[0]}`);
      return;
    }
    const actor = this.actor;
    if (this.etat.remplacer && actor.items.size) {
      const ok = await DialogV2.confirm({
        window: { title: "Remplacer les objets ?" },
        content: `<p>Les ${actor.items.size} objets actuels de <strong>${echapper(actor.name)}</strong> (armes, protections, équipement, stages) seront supprimés.</p>`,
        rejectClose: false
      });
      if (!ok) return;
    }
    try {
      await appliquerCreation(actor, this.etat, calc);
    } catch (err) {
      console.error(err);
      ui.notifications.error(`Création interrompue : ${err.message}`);
      return;
    }
    ui.notifications.info(`${actor.name} est prêt à patrouiller.`);
    this.close();
    actor.sheet?.render(true);
  }
}

/* -------------------------------------------- */
/*  Application au personnage                   */
/* -------------------------------------------- */

/** Récupère un objet de compendium par son nom, prêt à être créé. */
async function objetDepuisPack(def) {
  if (def.nouveau) {
    return { name: def.nouveau, type: "equipement", img: "icons/svg/item-bag.svg", system: { quantite: 1, description: `<p>${def.description ?? ""}</p>` } };
  }
  const pack = game.packs.get(`cops.${def.pack}`);
  const entree = pack?.index.find(e => e.name === def.nom);
  if (!entree) {
    ui.notifications.warn(`« ${def.nom} » introuvable dans le compendium ${def.pack}.`);
    return null;
  }
  const data = game.items.fromCompendium(await pack.getDocument(entree._id));
  if (def.suffixe) data.name += def.suffixe;
  if (def.equipee !== undefined) data.system.equipee = def.equipee;
  return data;
}

async function appliquerCreation(actor, etat, calc) {
  const r = R();
  const liste = items => `<ul>${items.map(t => `<li>${echapper(t)}</li>`).join("")}</ul>`;

  const historique = [
    `Origine sociale : ${calc.origine.label} — ${calc.option.label}`,
    `Études : ${calc.etude.label}`,
    `Entrée au COPS : ${calc.entree.label}`,
    `Stages de départ : ${calc.stagesChoisis.map(s => s.doc.name + (s.capacite ? ` (${s.capacite})` : "")).join(", ")}`
  ];
  let relations = `<h3>Relations de départ (à préciser)</h3>${liste(calc.relations)}`;
  if (etat.relationsNotes.trim()) relations += `<p>${echapper(etat.relationsNotes).replace(/\n/g, "<br>")}</p>`;
  if (actor.system.relations?.trim()) relations = `${actor.system.relations}${relations}`;
  let biographie = `<h3>Historique</h3>${liste(historique)}`;
  if (actor.system.biographie?.trim()) biographie = `${actor.system.biographie}${biographie}`;

  const nbLangues = Math.max(etat.caracs.education, etat.caracs.charme);
  const update = {
    "system.caracteristiques": { ...etat.caracs },
    "system.competences": Object.fromEntries(COMPETENCES.map(k => [k, {
      valeur: calc.competencesFinales[k],
      specialisation: calc.specialisations[k].requise || calc.competencesFinales[k] ? calc.specialisations[k].valeur : ""
    }])),
    "system.pv.bonus": 0, // le bonus de « Gonflette » est calculé à partir du stage
    "system.pv.value": calc.pvMax,
    "system.anciennete.value": calc.anciennete,
    "system.adrenaline.value": calc.adrenaline,
    "system.pointsStage": 0,
    "system.identite.grade": r.grade,
    "system.identite.origine": `${calc.origine.label} / ${calc.etude.label} / ${calc.entree.label}`,
    "system.finances.salaire": r.salaire, // les primes de stage s'ajoutent à la paie
    "system.finances.revenus": calc.revenus,
    "system.finances.argent": calc.argent,
    "system.relations": relations,
    "system.biographie": biographie
  };
  if (!actor.system.identite.langues?.trim()) {
    update["system.identite.langues"] = `Anglais + ${nbLangues - 1} autre${nbLangues > 2 ? "s" : ""} langue${nbLangues > 2 ? "s" : ""} au choix (espagnol conseillé)`;
  }

  // Objets : stages puis équipement.
  const nouveaux = [];
  for (const s of calc.stagesChoisis) {
    const data = game.items.fromCompendium(s.doc);
    data.system.capacite = s.capacite ?? "";
    data.system.cible = s.cible ?? "";
    nouveaux.push(data);
  }
  for (const def of calc.objets) {
    const data = await objetDepuisPack(def);
    if (data) nouveaux.push(data);
  }

  if (etat.remplacer && actor.items.size) {
    await actor.deleteEmbeddedDocuments("Item", actor.items.map(i => i.id));
  }
  await actor.update(update);
  await actor.createEmbeddedDocuments("Item", nouveaux);
}

/** Ouvre l'assistant pour un acteur de type « cop ». */
export function ouvrirCreation(actor) {
  if (actor?.type !== "cop") return ui.notifications.warn("L'assistant de création concerne les cops (personnages joueurs).");
  if (!actor.isOwner) return ui.notifications.warn("Vous n'êtes pas propriétaire de ce personnage.");
  return new CreationCops(actor).render({ force: true });
}

/** Fonctions internes exposées pour les tests hors Foundry. */
export const _interne = { etatInitial, calculer, caracsAleatoires, competencesAleatoires, etudesAleatoires, specialisationsAleatoires };
