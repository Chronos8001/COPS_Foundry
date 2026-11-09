import { COPS, localisationDepuisJet } from "./config.mjs";
import { renderTemplate, DialogV2, lireFormulaire } from "./compat.mjs";
import { effetsPourJet, effetConcerne, libelleEffet } from "./effets-stages.mjs";

const TEMPLATE_TEST = "systems/cops/templates/chat/test.hbs";
const TEMPLATE_DEGATS = "systems/cops/templates/chat/degats.hbs";
const TEMPLATE_DIALOGUE_TEST = "systems/cops/templates/dialog/test.hbs";
const TEMPLATE_DIALOGUE_ATTAQUE = "systems/cops/templates/dialog/attaque.hbs";

/* -------------------------------------------- */
/*  Calculs de base                             */
/* -------------------------------------------- */

/** Liste des modificateurs automatiques au nombre de dés pour une caractéristique donnée. */
function modificateursAuto(actor, carac) {
  const sys = actor.system;
  const mods = [];
  if (sys.blesse) mods.push({ label: "Blessé (< ½ PV)", valeur: -1 });
  if (COPS.caracPhysiques.includes(carac) && sys.malusArmure) {
    mods.push({ label: "Armure", valeur: -sys.malusArmure });
  }
  if (carac === "perception" && sys.malusPerception) {
    mods.push({ label: "Casque / masque", valeur: -sys.malusPerception });
  }
  return mods;
}

/**
 * Détermine le seuil et l'explosion des 10 selon la compétence.
 * Sans compétence (niveau 0) : réussite uniquement sur 10, pas de réussite critique.
 */
function seuilDe(actor, competence) {
  if (!competence) return { seuil: 6, critique: true, sansCompetence: false };
  let valeur = actor.system.competences[competence]?.valeur ?? 0;
  // « Petit génie » : niveau minimal dans certaines compétences.
  for (const e of actor.system.effetsStages?.effets ?? []) {
    if (e.type === "seuilMin" && e.competences.includes(competence) && (!valeur || valeur > e.valeur)) valeur = e.valeur;
  }
  if (!valeur) return { seuil: 10, critique: false, sansCompetence: true };
  return { seuil: valeur, critique: true, sansCompetence: false };
}

function libelleCompetence(actor, competence) {
  if (!competence) return null;
  const cfg = COPS.competences[competence];
  const spe = actor.system.competences[competence]?.specialisation;
  return spe ? `${cfg.label} [${spe}]` : cfg.label;
}

/**
 * Lance Nd10 et compte les réussites (les 10 sont relancés si critique autorisé).
 * Options de stage :
 *   bleu    le premier dé est un dé bleu : s'il réussit, il apporte une réussite de plus
 *           (un critique est relancé normalement mais n'ajoute qu'une réussite de plus) ;
 *   relance un dé en échec (hors dé bleu et hors relances de critiques) est relancé une fois.
 */
async function lancerD10(nbDes, seuil, critique, { bleu = false, relance = false } = {}) {
  const s = Math.clamp(seuil, 2, 10);
  const x = critique ? "x" : "";
  const roll = await new Roll(`${nbDes}d10${x}cs>=${s}`).evaluate();
  const rolls = [roll];
  // Les dés d'origine sont les nbDes premiers résultats ; les relances de critiques suivent.
  const des = roll.dice[0].results.map((r, i) => ({
    valeur: r.result,
    succes: r.result >= s,
    critique: critique && r.result === 10,
    bleu: bleu && i === 0
  }));
  let succes = roll.total;
  if (bleu && des[0]?.succes) succes += 1;

  if (relance) {
    const idx = des.findIndex((d, i) => i < nbDes && !d.succes && !d.bleu);
    if (idx >= 0) {
      const r2 = await new Roll(`1d10${x}cs>=${s}`).evaluate();
      rolls.push(r2);
      des[idx].relance = true;
      des.push(...r2.dice[0].results.map(r => ({
        valeur: r.result, succes: r.result >= s, critique: critique && r.result === 10, nouveau: true
      })));
      succes += r2.total;
    }
  }
  return { roll, rolls, des, succes };
}

/**
 * Applique les effets de stage (automatiques + optionnels cochés) à un jet :
 * dés bonus ajoutés aux modificateurs, et options de lancer (dé bleu, relance).
 */
function effetsDeStage(actor, jet, choisis = [], mods) {
  const analyse = actor.system.effetsStages;
  if (!analyse) return { options: {}, notes: [] };
  const { auto, optionnels } = effetsPourJet(analyse, jet);
  const actifs = [...auto, ...optionnels.filter(e => choisis.includes(e.id))];
  const notes = [];
  for (const e of actifs) {
    if (e.type === "desBonus") mods.push({ label: e.source, valeur: e.valeur });
    else notes.push(`${libelleEffet(e)} — ${e.source}`);
  }
  return {
    options: { bleu: actifs.some(e => e.type === "deBleu"), relance: actifs.some(e => e.type === "relance") },
    notes
  };
}

/** Options à cocher proposées dans un dialogue de jet. */
function optionsDeStage(actor, jet) {
  const analyse = actor.system.effetsStages;
  if (!analyse) return [];
  return effetsPourJet(analyse, jet).optionnels.map(e => ({
    id: e.id, label: `${e.condition} : ${libelleEffet(e)}`, source: e.source
  }));
}

/** Nombre de points d'Adrénaline dépensables d'un coup (« Hyper réactif » : tous). */
function adrenalineMax(actor) {
  const sys = actor.system;
  const multi = sys.effetsStages?.effets.some(e => e.type === "adrenalineMulti");
  return multi ? sys.adrenaline.value : Math.min(1, sys.adrenaline.value);
}

/** Dépense l'adrénaline demandée (nombre ou case cochée) et l'ajoute aux modificateurs. */
async function depenserAdrenaline(actor, demande, mods) {
  const n = Math.min(Number(demande) || 0, adrenalineMax(actor));
  if (!n) {
    if (Number(demande)) ui.notifications.warn("Plus de points d'adrénaline.");
    return;
  }
  await actor.update({ "system.adrenaline.value": actor.system.adrenaline.value - n });
  mods.push({ label: "Adrénaline", valeur: n });
}

/** Les cases « effets de stage » cochées dans un formulaire. */
function effetsCoches(data) {
  return Object.entries(data).filter(([k, v]) => k.startsWith("stage-") && v).map(([k]) => k.slice(6));
}

function ancienneteDouble(actor, jet) {
  return !!actor.system.effetsStages?.effets.some(e => e.type === "ancienneteDouble" && effetConcerne(e, jet));
}

function resultat(ctx) {
  ctx.marge = ctx.succes - ctx.difficulte;
  if (ctx.difficulte <= 0) {
    ctx.issue = "opposition";
    ctx.issueLabel = `${ctx.succes} réussite(s) — à comparer avec l'adversaire`;
  } else if (ctx.marge >= 0) {
    ctx.issue = "reussite";
    ctx.issueLabel = ctx.marge > 0 ? `Réussite (marge ${ctx.marge})` : "Réussite";
  } else {
    ctx.issue = "echec";
    ctx.issueLabel = `Échec (marge d'échec ${-ctx.marge})`;
  }
  ctx.peutAnciennete = ctx.issue === "echec";
  return ctx;
}

async function creerMessage(actor, ctx, rolls) {
  const content = await renderTemplate(TEMPLATE_TEST, ctx);
  return ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }),
    content,
    rolls,
    sound: CONFIG.sounds.dice,
    flags: { cops: { contexte: ctx } }
  });
}

/* -------------------------------------------- */
/*  Jets de caractéristique / compétence         */
/* -------------------------------------------- */

/**
 * Ouvre le dialogue de jet. `carac` et `competence` pré-remplissent le formulaire.
 */
export async function dialogueTest(actor, { carac = null, competence = null } = {}) {
  if (competence && !carac) carac = COPS.competences[competence].carac;
  carac ??= "perception";

  const competences = { "": "— Aucune (jet de caractéristique)" };
  for (const [k, c] of Object.entries(COPS.competences)) {
    const v = actor.system.competences[k].valeur;
    competences[k] = `${c.label} (${v ? v + "+" : "non acquise"})`;
  }

  const content = await renderTemplate(TEMPLATE_DIALOGUE_TEST, {
    caracteristiques: COPS.caracteristiques,
    competences,
    carac,
    competence: competence ?? "",
    adrenaline: actor.system.adrenaline.value,
    adrenalineMax: adrenalineMax(actor),
    adrenalineMulti: adrenalineMax(actor) > 1,
    optionsStages: optionsDeStage(actor, { carac, competence }),
    difficulte: 1
  });

  const data = await DialogV2().prompt({
    window: { title: `Jet — ${actor.name}` },
    content,
    ok: {
      label: "Lancer",
      icon: "fa-solid fa-dice-d10",
      callback: (event, button) => lireFormulaire(button.form)
    },
    rejectClose: false
  });
  if (!data) return;

  return lancerTest(actor, {
    carac: data.carac,
    competence: data.competence || null,
    difficulte: data.difficulte,
    modDes: data.modDes,
    modSeuil: data.modSeuil,
    adrenaline: data.adrenaline,
    effets: effetsCoches(data)
  });
}

export async function lancerTest(actor, { carac, competence = null, difficulte = 1, modDes = 0, modSeuil = 0, adrenaline = 0, effets = [], titre = null }) {
  const sys = actor.system;
  const mods = modificateursAuto(actor, carac);
  if (modDes) mods.push({ label: "Modificateur", valeur: modDes });
  const jet = { carac, competence };
  const stage = effetsDeStage(actor, jet, effets, mods);

  if (Number(adrenaline)) {
    // « Combat de localité » : l'adrénaline devient utilisable sur certaines compétences.
    const parStage = sys.effetsStages?.effets.some(e => e.type === "adrenaline" && e.competences.includes(competence));
    const autorise = !competence || COPS.competences[competence].adrenaline || parStage;
    if (!autorise) ui.notifications.warn("L'adrénaline ne peut pas être utilisée avec cette compétence.");
    else await depenserAdrenaline(actor, adrenaline, mods);
  }

  const base = sys.caracteristiques[carac];
  const nbDes = base + mods.reduce((t, m) => t + m.valeur, 0);
  const { seuil: seuilBase, critique, sansCompetence } = seuilDe(actor, competence);
  const seuil = Math.clamp(seuilBase + (modSeuil || 0), 2, 10);

  const ctx = {
    type: "test",
    actorUuid: actor.uuid,
    titre: titre ?? libelleCompetence(actor, competence) ?? COPS.caracteristiques[carac],
    sousTitre: competence ? `${libelleCompetence(actor, competence)} / ${COPS.caracteristiques[carac]}` : COPS.caracteristiques[carac],
    caracValeur: base,
    mods,
    nbDes,
    seuil,
    sansCompetence,
    difficulte: Number(difficulte) || 0,
    ancienneteUtilisee: 0,
    ancienneteDouble: ancienneteDouble(actor, jet),
    notesStages: stage.notes
  };

  if (nbDes < 1) {
    ctx.impossible = true;
    ctx.succes = 0;
    ctx.des = [];
    resultat(ctx);
    ctx.peutAnciennete = false;
    ctx.issueLabel = "Action impossible (moins d'un dé)";
    return creerMessage(actor, ctx, []);
  }

  const { rolls, des, succes } = await lancerD10(nbDes, seuil, critique, stage.options);
  ctx.des = des;
  ctx.succes = succes;
  resultat(ctx);
  return creerMessage(actor, ctx, rolls);
}

/* -------------------------------------------- */
/*  Attaques                                     */
/* -------------------------------------------- */

export async function dialogueAttaque(actor, arme) {
  const sys = actor.system;
  const a = arme.system;
  const distance = a.estDistance;
  const ctOptions = {};
  for (let i = 1; i <= Math.max(1, a.cadence); i++) ctOptions[i] = `${i}${i === 1 ? "er" : "e"} tir du tour (${i === 1 ? "pas de malus" : `-${i - 1} dé`})`;

  const content = await renderTemplate(TEMPLATE_DIALOGUE_ATTAQUE, {
    arme,
    distance,
    rafale: a.vrc > 0,
    distances: Object.fromEntries(Object.entries(COPS.distances).map(([k, d]) => [k, `${d.label} — diff. ${d.difficulte}`])),
    attitudes: COPS.attitudes,
    initiatives: COPS.initiatives,
    attitude: sys.combat.attitude,
    initiative: sys.combat.initiative,
    ctOptions,
    adrenaline: sys.adrenaline.value,
    adrenalineMax: adrenalineMax(actor),
    adrenalineMulti: adrenalineMax(actor) > 1,
    munitions: a.munitions,
    optionsStages: optionsDeStage(actor, { carac: COPS.competences[a.competence].carac, competence: a.competence }),
    visees: optionsVisee(actor, distance),
    rafaleMaitrisee: a.vrc > 0 && sys.effetsStages?.rafaleMaitrisee,
    bonusStages: resumeBonusArme(actor, arme)
  });

  const data = await DialogV2().prompt({
    window: { title: `Attaque — ${arme.name}` },
    content,
    ok: {
      label: "Attaquer",
      icon: "fa-solid fa-crosshairs",
      callback: (event, button) => lireFormulaire(button.form)
    },
    rejectClose: false
  });
  if (!data) return;
  return lancerAttaque(actor, arme, data);
}

/** Tirs visés offerts par les capacités « Tir incapacitant » et « Sniper » (+2 en difficulté). */
function optionsVisee(actor, distance) {
  const st = actor.system.effetsStages;
  if (!distance || !st) return [];
  const opts = [];
  if (st.tirIncapacitant) {
    opts.push({ value: "bras", label: "Tir incapacitant : bras (+2 diff.)" }, { value: "jambes", label: "Tir incapacitant : jambe (+2 diff.)" });
  }
  if (st.sniper) {
    for (const [k, l] of Object.entries(COPS.localisations)) opts.push({ value: `sniper-${k}`, label: `Sniper (après un tour à viser) : ${l.label} (+2 diff.)` });
  }
  return opts.length ? [{ value: "", label: "— Tir normal —" }, ...opts] : [];
}

function resumeBonusArme(actor, arme) {
  const b = actor.system.effetsStages?.bonusArme(arme);
  if (!b || (!b.degats && !b.loc)) return "";
  const parties = [];
  if (b.degats) parties.push(`+${b.degats} dommages`);
  if (b.loc) parties.push(`±${b.loc} localisation`);
  return `${parties.join(" et ")} (${b.sources.join(", ")}), dans la limite de la marge de réussite${b.cumul ? " (cumulables)" : ""}`;
}

export async function lancerAttaque(actor, arme, opts) {
  const sys = actor.system;
  const a = arme.system;
  const distance = a.estDistance;
  const rafale = opts.mode === "rafale" && a.vrc > 0;
  const competence = rafale ? "tirEnRafales" : a.competence;
  const carac = COPS.competences[competence].carac;

  // Munitions
  const consommees = distance && a.categorie !== "lancer" ? (rafale ? a.vrc : 1) : 0;
  if (consommees && opts.consommer) {
    if (a.munitions.value < 1) {
      ui.notifications.warn(`${arme.name} : plus de munitions !`);
      return;
    }
    await arme.update({ "system.munitions.value": Math.max(0, a.munitions.value - consommees) });
  }

  const mods = modificateursAuto(actor, carac);
  if (a.precision) mods.push({ label: "Précision", valeur: a.precision });
  const attitude = Number(opts.attitude) || 0;
  if (attitude) mods.push({ label: "Attitude", valeur: attitude });
  if (distance) {
    const init = Number(opts.initiative) || 0;
    if (init) mods.push({ label: "Initiative", valeur: init });
    if (opts.distance === "boutPortant") mods.push({ label: "Bout portant", valeur: 1 });
    const numero = Number(opts.numeroTir) || 1;
    if (numero > 1) mods.push({ label: `Tir n°${numero} du tour`, valeur: -(numero - 1) });
  }
  if (opts.modDes) mods.push({ label: "Modificateur", valeur: opts.modDes });
  const jet = { carac, competence };
  const stage = effetsDeStage(actor, jet, effetsCoches(opts), mods);
  if (Number(opts.adrenaline)) await depenserAdrenaline(actor, opts.adrenaline, mods);

  let difficulte = 0;
  let locForcee = null;
  if (distance) {
    difficulte = COPS.distances[opts.distance]?.difficulte ?? 2;
    difficulte -= Number(opts.attitudeCible) || 0;
    difficulte += Number(opts.modDifficulte) || 0;
    // Tir visé (« Tir incapacitant », « Sniper ») : +2 en difficulté, localisation choisie.
    if (opts.visee && optionsVisee(actor, true).some(o => o.value === opts.visee)) {
      difficulte += 2;
      locForcee = opts.visee.replace("sniper-", "");
      stage.notes.push(`Tir visé : ${COPS.localisations[locForcee].label} (+2 difficulté)`);
    }
    difficulte = Math.max(1, difficulte);
  }
  const bonusArme = sys.effetsStages?.bonusArme(arme) ?? { degats: 0, loc: 0, cumul: false, sources: [] };
  const pointFaible = !!(distance && sys.effetsStages?.pointFaible);
  const memeLoc = !!(rafale && opts.rafaleMaitrisee && sys.effetsStages?.rafaleMaitrisee);
  if (memeLoc) stage.notes.push("Rafale maîtrisée : toutes les balles dans la même localisation");

  const base = sys.caracteristiques[carac];
  const nbDes = base + mods.reduce((t, m) => t + m.valeur, 0);
  const { seuil, critique, sansCompetence } = seuilDe(actor, competence);

  const ctx = {
    type: "attaque",
    actorUuid: actor.uuid,
    armeNom: arme.name,
    titre: `${arme.name}${rafale ? " — rafale courte" : ""}`,
    sousTitre: `${libelleCompetence(actor, competence)} / ${COPS.caracteristiques[carac]}`,
    caracValeur: base,
    mods,
    nbDes,
    seuil,
    sansCompetence,
    difficulte,
    rafale,
    vrc: a.vrc,
    puissance: a.puissance,
    forceArret: a.forceArret,
    relanceUn: a.relanceUn,
    dommagesSpeciaux: a.dommagesSpeciaux,
    consommees: opts.consommer ? consommees : 0,
    ancienneteUtilisee: 0,
    ancienneteDouble: ancienneteDouble(actor, jet),
    notesStages: stage.notes,
    locForcee,
    memeLoc,
    stage: (bonusArme.degats || bonusArme.loc || pointFaible)
      ? { degats: bonusArme.degats, loc: bonusArme.loc, cumul: bonusArme.cumul, pointFaible, sources: bonusArme.sources.join(", ") }
      : null,
    impacts: []
  };

  if (nbDes < 1) {
    ctx.impossible = true;
    ctx.succes = 0;
    ctx.des = [];
    resultat(ctx);
    ctx.peutAnciennete = false;
    ctx.issueLabel = "Tir impossible (moins d'un dé)";
    return creerMessage(actor, ctx, []);
  }

  const lancer = await lancerD10(nbDes, seuil, critique, stage.options);
  ctx.des = lancer.des;
  ctx.succes = lancer.succes;
  resultat(ctx);
  const rolls = [...lancer.rolls];
  if (ctx.issue !== "echec") rolls.push(...(await construireImpacts(ctx)));
  return creerMessage(actor, ctx, rolls);
}

/**
 * Lance localisation et dés de puissance pour chaque balle qui touche.
 * En corps à corps (opposition), un impact est préparé : le MJ l'applique si l'attaquant l'emporte.
 */
async function construireImpacts(ctx) {
  const rolls = [];
  ctx.impacts = [];
  // Fumigène, lacrymogène… : ni dommages ni force d'arrêt, seul le jet compte.
  if (!ctx.dommagesSpeciaux && ctx.puissance <= 0 && ctx.forceArret <= 0) return rolls;
  let nbBalles = 1;
  if (ctx.rafale) nbBalles = Math.min(ctx.vrc, 1 + Math.max(0, ctx.marge));

  // Dommages non localisés (explosifs).
  if (ctx.dommagesSpeciaux) {
    const r = await new Roll(ctx.dommagesSpeciaux).evaluate();
    rolls.push(r);
    ctx.impacts = [{
      index: 0, localise: false, locLabel: "Non localisé", locMod: 0,
      degats: r.total, faDiff: ctx.forceArret
    }];
    return rolls;
  }

  // Un tir visé n'a pas besoin de jet de localisation.
  const rLoc = ctx.locForcee ? null : await new Roll("1d10").evaluate();
  if (rLoc) rolls.push(rLoc);
  ctx.impacts = [];
  for (let i = 0; i < nbBalles; i++) {
    // Rafale : +1 à la localisation par balle (sauf « Rafale maîtrisée » ou tir visé).
    const jet = rLoc ? rLoc.total + (ctx.memeLoc ? 0 : i) : null;
    if (jet > 10) {
      ctx.impacts.push({ index: i, numero: i + 1, rate: true, locJet: jet, locLabel: "Balle perdue (> 10)" });
      continue;
    }
    // Puissance nulle (Taser…) : pas de dommages mais la force d'arrêt s'applique.
    let rDeg = null;
    if (ctx.puissance > 0) {
      rDeg = await new Roll(`${ctx.puissance}d6${ctx.relanceUn ? "rr1" : ""}`).evaluate();
      rolls.push(rDeg);
    }
    const impact = {
      index: i,
      localise: true,
      locJetBase: jet,
      locShift: 0,
      degatsBase: rDeg?.total ?? 0,
      bonusDeg: 0,
      ignoreArmure: false,
      detailDegats: rDeg?.dice[0]?.results.filter(r => r.active).map(r => r.result).join(", ") ?? ""
    };
    // Bonus de dommages des stages, appliqué d'office dans la limite de la marge (tir à distance).
    if (ctx.stage?.degats && ctx.difficulte > 0) impact.bonusDeg = Math.min(ctx.stage.degats, budgetStage(ctx));
    recalculerImpact(ctx, impact);
    ctx.impacts.push(impact);
  }
  return rolls;
}

/** Marge disponible pour les bonus de stage (illimitée en opposition : à vérifier face à l'adversaire). */
function budgetStage(ctx) {
  return ctx.difficulte > 0 ? Math.max(0, ctx.marge) : Infinity;
}

/** Points de marge consommés par les bonus d'un impact (niveau 3 : dommages et localisation se cumulent). */
function coutStage(ctx, imp) {
  const deg = imp.bonusDeg, loc = Math.abs(imp.locShift);
  return (ctx.stage?.cumul ? Math.max(deg, loc) : deg + loc) + (imp.ignoreArmure ? 2 : 0);
}

/** Recalcule localisation, dommages et FA d'un impact à partir de ses valeurs de base et des bonus. */
function recalculerImpact(ctx, imp) {
  if (ctx.locForcee) {
    imp.loc = ctx.locForcee;
    imp.locJet = "visé";
  } else {
    imp.locJet = Math.clamp(imp.locJetBase + imp.locShift, 1, 10);
    imp.loc = localisationDepuisJet(imp.locJet);
  }
  const cfg = COPS.localisations[imp.loc];
  imp.locLabel = cfg.label;
  imp.locMod = cfg.mod;
  imp.degats = imp.degatsBase + imp.bonusDeg;
  imp.faDiff = ctx.forceArret + cfg.mod;
  if (ctx.stage) {
    imp.stageReste = budgetStage(ctx) === Infinity ? null : budgetStage(ctx) - coutStage(ctx, imp);
    imp.peutLoc = !!ctx.stage.loc && !ctx.locForcee;
  }
  return imp;
}

/** Boutons de la carte : ajuster les bonus de stage d'un impact (dommages, localisation, Point faible). */
async function ajusterImpact(message, index, champ, delta) {
  if (!message.isOwner) return ui.notifications.warn("Seul l'auteur du jet peut répartir sa marge.");
  const ctx = foundry.utils.deepClone(message.getFlag("cops", "contexte"));
  const imp = ctx.impacts?.[index];
  if (!ctx.stage || !imp || imp.rate) return;
  const essai = { ...imp };
  if (champ === "deg") essai.bonusDeg = Math.clamp(imp.bonusDeg + delta, 0, ctx.stage.degats);
  else if (champ === "loc") essai.locShift = Math.clamp(imp.locShift + delta, -ctx.stage.loc, ctx.stage.loc);
  else if (champ === "pf") essai.ignoreArmure = !imp.ignoreArmure;
  if (coutStage(ctx, essai) > budgetStage(ctx)) return ui.notifications.warn("Marge de réussite insuffisante pour ce bonus.");
  ctx.impacts[index] = recalculerImpact(ctx, essai);
  const content = await renderTemplate(TEMPLATE_TEST, ctx);
  await message.update({ content, "flags.cops.contexte": ctx });
}

/* -------------------------------------------- */
/*  Ancienneté                                   */
/* -------------------------------------------- */

async function utiliserAnciennete(message) {
  const ctx = foundry.utils.deepClone(message.getFlag("cops", "contexte"));
  const actor = await fromUuid(ctx.actorUuid);
  if (!actor?.isOwner) return ui.notifications.warn("Vous ne contrôlez pas ce personnage.");
  if (ctx.issue !== "echec") return;
  if (actor.system.anciennete.value < 1) return ui.notifications.warn("Plus de points d'ancienneté.");

  await actor.update({ "system.anciennete.value": actor.system.anciennete.value - 1 });
  // « Opération ninja blanc » : un point d'Ancienneté vaut 2 réussites sur les jets physiques et de Sang-froid.
  const gain = ctx.ancienneteDouble ? 2 : 1;
  ctx.succes += gain;
  ctx.ancienneteUtilisee += gain;
  resultat(ctx);
  // L'ancienneté ne peut que ramener la marge à 0.
  if (ctx.issue === "reussite") ctx.marge = 0;

  const rolls = [];
  if (ctx.type === "attaque" && ctx.issue === "reussite") rolls.push(...(await construireImpacts(ctx)));
  for (const r of rolls) {
    // Affiche les jets supplémentaires (et Dice So Nice si présent).
    if (game.dice3d) game.dice3d.showForRoll(r, game.user, true);
  }

  const content = await renderTemplate(TEMPLATE_TEST, ctx);
  await message.update({ content, "flags.cops.contexte": ctx });
}

/* -------------------------------------------- */
/*  Dégâts et force d'arrêt                      */
/* -------------------------------------------- */

function ciblesActuelles() {
  const cibles = game.user.targets.size ? [...game.user.targets] : canvas.tokens?.controlled ?? [];
  return cibles.map(t => t.actor).filter(a => a);
}

/** Meilleur dé + meilleur bonus parmi les armures équipées couvrant la localisation. */
function protectionPour(actor, loc) {
  let des = 0, bonus = 0;
  const noms = [];
  for (const item of actor.items) {
    if (item.type !== "armure" || !item.system.equipee || !item.system.zones[loc]) continue;
    const p = item.system.protectionParsee;
    des = Math.max(des, p.des);
    bonus = Math.max(bonus, p.bonus);
    noms.push(item.name);
  }
  return { des, bonus, noms };
}

async function appliquerImpact(message, index) {
  const ctx = message.getFlag("cops", "contexte");
  const impact = ctx.impacts?.[index];
  if (!impact || impact.rate) return;
  const cibles = ciblesActuelles();
  if (!cibles.length) return ui.notifications.warn("Ciblez (T) ou sélectionnez le(s) token(s) touché(s).");

  for (const cible of cibles) {
    if (!cible.isOwner) {
      ui.notifications.warn(`Vous ne pouvez pas modifier ${cible.name} : demandez au MJ d'appliquer les dégâts.`);
      continue;
    }
    const rolls = [];
    const res = {
      cibleUuid: cible.uuid,
      cibleNom: cible.name,
      armeNom: ctx.armeNom,
      locLabel: impact.locLabel,
      degatsBruts: impact.degats,
      protection: 0,
      faDiff: impact.faDiff
    };

    if (impact.ignoreArmure) {
      res.protectionNoms = "ignorée (Point faible)";
    } else if (impact.localise) {
      const p = protectionPour(cible, impact.loc);
      if (p.des || p.bonus) {
        const r = await new Roll(`${p.des}d6 + ${p.bonus}`).evaluate();
        rolls.push(r);
        res.protection = r.total;
        res.protectionNoms = p.noms.join(", ");
      }
    }

    const net = impact.degats - res.protection;
    res.degatsLoc = 0;
    if (net <= 0) {
      res.total = 0;
      res.arrete = true;
    } else {
      res.total = net;
      if (impact.locMod > 0) {
        const r = await new Roll(`${impact.locMod}d6`).evaluate();
        rolls.push(r);
        res.degatsLoc = r.total;
        res.total += r.total;
      }
    }

    const sys = cible.system;
    const avant = sys.pv.value;
    const apres = avant - res.total;
    if (res.total) await cible.update({ "system.pv.value": apres });
    res.pvAvant = avant;
    res.pvApres = apres;
    res.massif = res.total >= 15;
    res.inconscient = apres <= 0 && apres > -sys.pv.max;
    res.mort = apres <= -sys.pv.max;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: cible }),
      content: await renderTemplate(TEMPLATE_DEGATS, res),
      rolls,
      flags: { cops: { degats: res } }
    });
  }
}

export async function jetForceArret(actor, difficulte) {
  const sys = actor.system;
  const carac = sys.caracteristiques.carrure >= sys.caracteristiques.sangfroid ? "carrure" : "sangfroid";
  const nbDes = sys.caracteristiques[carac];
  // « Solide comme l'acier » : un dé bleu aux jets d'encaissement.
  const bleu = !!sys.effetsStages?.effets.some(e => e.type === "encaissement");
  const { rolls, des, succes } = await lancerD10(nbDes, 6, true, { bleu });
  const ctx = {
    type: "forceArret",
    actorUuid: actor.uuid,
    titre: "Force d'arrêt",
    sousTitre: `${COPS.caracteristiques[carac]} (6+)`,
    caracValeur: nbDes,
    mods: [],
    nbDes,
    seuil: 6,
    difficulte,
    des,
    succes,
    ancienneteUtilisee: 0,
    ancienneteDouble: ancienneteDouble(actor, { carac, competence: null }),
    notesStages: bleu ? ["1 dé bleu — Solide comme l'acier"] : []
  };
  resultat(ctx);
  if (ctx.issue === "reussite") ctx.note = "Tient le choc : initiative non négative au prochain tour.";
  else if (succes > 0) ctx.note = "Sonné : -1 dé à la prochaine action et initiative non négative au prochain tour.";
  else ctx.note = "Hors de combat ! Nouveau jet à chaque tour (difficulté -1 par tour après le premier).";
  return creerMessage(actor, ctx, rolls);
}

/* -------------------------------------------- */
/*  Boutons des messages                         */
/* -------------------------------------------- */

export function activerBoutonsChat(message, html) {
  const root = html instanceof HTMLElement ? html : html[0];
  if (!root) return;
  root.querySelectorAll("[data-cops-action]").forEach(btn => {
    btn.addEventListener("click", async ev => {
      ev.preventDefault();
      btn.disabled = true;
      try {
        switch (btn.dataset.copsAction) {
          case "anciennete":
            await utiliserAnciennete(message);
            break;
          case "appliquer":
            await appliquerImpact(message, Number(btn.dataset.index));
            break;
          case "stage":
            await ajusterImpact(message, Number(btn.dataset.index), btn.dataset.champ, Number(btn.dataset.delta) || 0);
            break;
          case "force-arret": {
            const actor = await fromUuid(btn.dataset.actor);
            if (!actor?.isOwner) return ui.notifications.warn("Vous ne contrôlez pas ce personnage.");
            await jetForceArret(actor, Number(btn.dataset.difficulte));
            break;
          }
        }
      } finally {
        btn.disabled = false;
      }
    });
  });
}
