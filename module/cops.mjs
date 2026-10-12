import { COPS } from "./config.mjs";
import { CopData, PnjData } from "./data/actor.mjs";
import { ArmeData, ArmureData, EquipementData, StageData } from "./data/item.mjs";
import { CopsCombat, CopsCombatant } from "./documents/combat.mjs";
import { CopsActorSheet } from "./sheets/actor-sheet.mjs";
import { CopsItemSheet } from "./sheets/item-sheet.mjs";
import { activerBoutonsChat, dialogueTest, dialogueAttaque, jetForceArret } from "./dice.mjs";
import { loadTemplates, ActorsCollection, ItemsCollection } from "./compat.mjs";

Hooks.once("init", () => {
  console.log("COPS | Initialisation du système");

  CONFIG.COPS = COPS;
  game.cops = { COPS, dialogueTest, dialogueAttaque, jetForceArret };

  Object.assign(CONFIG.Actor.dataModels, { cop: CopData, pnj: PnjData });
  Object.assign(CONFIG.Item.dataModels, {
    arme: ArmeData,
    armure: ArmureData,
    equipement: EquipementData,
    stage: StageData
  });
  CONFIG.Actor.trackableAttributes = {
    cop: { bar: ["pv"], value: ["adrenaline.value", "anciennete.value"] },
    pnj: { bar: ["pv"], value: ["adrenaline.value", "anciennete.value"] }
  };

  CONFIG.Combat.documentClass = CopsCombat;
  CONFIG.Combatant.documentClass = CopsCombatant;
  CONFIG.Combat.initiative = { formula: "0", decimals: 0 };

  const Actors = ActorsCollection();
  const Items = ItemsCollection();
  Actors.registerSheet("cops", CopsActorSheet, { types: ["cop", "pnj"], makeDefault: true, label: "Fiche COPS" });
  Items.registerSheet("cops", CopsItemSheet, { makeDefault: true, label: "Fiche d'objet COPS" });

  Handlebars.registerHelper("copsSigne", n => (Number(n) > 0 ? `+${n}` : `${n}`));
  Handlebars.registerHelper("copsEq", (a, b) => a == b);

  // Boutons des cartes de chat (v13 : renderChatMessageHTML ; v12 : renderChatMessage).
  Hooks.on(game.release.generation >= 13 ? "renderChatMessageHTML" : "renderChatMessage", activerBoutonsChat);

  loadTemplates([
    "systems/cops/templates/actor/parts/competences.hbs",
    "systems/cops/templates/actor/parts/combat.hbs",
    "systems/cops/templates/actor/parts/inventaire.hbs"
  ]);
});


/* Les PV d'un nouveau personnage démarrent au maximum. */
Hooks.on("preCreateActor", (actor, data) => {
  if (foundry.utils.hasProperty(data, "system.pv.value")) return;
  const carrure = foundry.utils.getProperty(data, "system.caracteristiques.carrure") ?? 2;
  const base = actor.type === "cop" ? 20 : 10;
  actor.updateSource({
    "system.pv.value": base + carrure * 3,
    "prototypeToken.actorLink": actor.type === "cop",
    "prototypeToken.disposition": actor.type === "cop" ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.NEUTRAL
  });
});
