import { COPS } from "../config.mjs";
import { ActorSheetV1, TextEditorImpl } from "../compat.mjs";
import { dialogueTest, dialogueAttaque } from "../dice.mjs";

export class CopsActorSheet extends ActorSheetV1() {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cops", "sheet", "actor"],
      template: "systems/cops/templates/actor/actor-sheet.hbs",
      width: 760,
      height: 820,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "competences" }],
      dragDrop: [{ dragSelector: ".item-list .item", dropSelector: null }]
    });
  }

  async getData(options) {
    const context = await super.getData(options);
    const actor = this.actor;
    const sys = actor.system;
    context.system = sys;
    context.COPS = COPS;
    context.estCop = actor.type === "cop";

    context.caracteristiques = Object.entries(COPS.caracteristiques).map(([key, label]) => ({
      key, label, valeur: sys.caracteristiques[key]
    }));
    context.totalCaracs = Object.values(sys.caracteristiques).reduce((a, b) => a + b, 0);

    context.competences = Object.entries(COPS.competences).map(([key, cfg]) => {
      const c = sys.competences[key];
      return {
        key,
        label: cfg.label,
        carac: COPS.caracteristiques[cfg.carac].slice(0, 4) + ".",
        valeur: c.valeur,
        specialisation: c.specialisation,
        acquise: c.valeur > 0,
        speRequise: cfg.spe && c.valeur && c.valeur <= cfg.spe,
        speTitre: cfg.spe ? `Spécialisation requise à partir de ${cfg.spe}+ (${(cfg.specialisations ?? []).join(", ") || "au choix"})` : "",
        adrenaline: cfg.adrenaline
      };
    });

    // Options d'initiative limitées par les Réflexes.
    context.initiativesAutorisees = COPS.initiatives.filter(i => i.value >= sys.initiativeMin);

    const items = actor.items.contents.sort((a, b) => (a.sort || 0) - (b.sort || 0));
    context.armes = items.filter(i => i.type === "arme");
    context.armures = items.filter(i => i.type === "armure");
    context.equipements = items.filter(i => i.type === "equipement");
    context.stages = items.filter(i => i.type === "stage");

    const TE = TextEditorImpl();
    const enrichOpts = { secrets: actor.isOwner, relativeTo: actor };
    context.biographieHTML = await TE.enrichHTML(sys.biographie, enrichOpts);
    context.relationsHTML = await TE.enrichHTML(sys.relations, enrichOpts);
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root = html[0] ?? html;

    // Les jets sont aussi accessibles en lecture seule pour les propriétaires.
    if (!this.actor.isOwner) return;

    root.querySelectorAll("[data-jet-carac]").forEach(el =>
      el.addEventListener("click", () => dialogueTest(this.actor, { carac: el.dataset.jetCarac })));
    root.querySelectorAll("[data-jet-competence]").forEach(el =>
      el.addEventListener("click", () => dialogueTest(this.actor, { competence: el.dataset.jetCompetence })));
    root.querySelectorAll("[data-attaque]").forEach(el =>
      el.addEventListener("click", () => {
        const arme = this.actor.items.get(el.dataset.attaque);
        if (arme) dialogueAttaque(this.actor, arme);
      }));

    if (!this.isEditable) return;

    root.querySelectorAll("[data-item-create]").forEach(el =>
      el.addEventListener("click", () => this.actor.createEmbeddedDocuments("Item", [{
        name: `Nouvel objet (${game.i18n.localize(`TYPES.Item.${el.dataset.itemCreate}`)})`,
        type: el.dataset.itemCreate
      }], { renderSheet: true })));
    root.querySelectorAll("[data-item-edit]").forEach(el =>
      el.addEventListener("click", ev => {
        this.actor.items.get(ev.currentTarget.closest("[data-item-id]").dataset.itemId)?.sheet.render(true);
      }));
    root.querySelectorAll("[data-item-delete]").forEach(el =>
      el.addEventListener("click", ev => {
        const item = this.actor.items.get(ev.currentTarget.closest("[data-item-id]").dataset.itemId);
        item?.deleteDialog();
      }));
    root.querySelectorAll("[data-item-toggle]").forEach(el =>
      el.addEventListener("click", ev => {
        const item = this.actor.items.get(ev.currentTarget.closest("[data-item-id]").dataset.itemId);
        item?.update({ "system.equipee": !item.system.equipee });
      }));
    root.querySelectorAll("[data-recharger]").forEach(el =>
      el.addEventListener("click", ev => {
        const item = this.actor.items.get(ev.currentTarget.closest("[data-item-id]").dataset.itemId);
        item?.update({ "system.munitions.value": item.system.munitions.max });
      }));
    root.querySelectorAll("[data-repos]").forEach(el =>
      el.addEventListener("click", () => this._nuitDeRepos()));
  }

  /** Une nuit de repos : +1 point d'adrénaline ou d'ancienneté (au choix), dans la limite de 5 au total. */
  async _nuitDeRepos() {
    const sys = this.actor.system;
    if (sys.adrenaline.value + sys.anciennete.value >= COPS.maxPointsAdrAnc) {
      return ui.notifications.info("Adrénaline + Ancienneté déjà au maximum (5).");
    }
    const choix = await foundry.applications.api.DialogV2.wait({
      window: { title: "Nuit de repos" },
      content: "<p>Récupérer 1 point de :</p>",
      buttons: [
        { action: "adrenaline", label: "Adrénaline", default: true },
        { action: "anciennete", label: "Ancienneté" }
      ],
      rejectClose: false
    });
    if (!choix) return;
    await this.actor.update({ [`system.${choix}.value`]: sys[choix].value + 1 });
  }

  /** Empêche Adrénaline + Ancienneté de dépasser 5 et contraint l'initiative. */
  async _updateObject(event, formData) {
    const sys = this.actor.system;
    const adr = formData["system.adrenaline.value"] ?? sys.adrenaline.value;
    const anc = formData["system.anciennete.value"] ?? sys.anciennete.value;
    if (adr + anc > COPS.maxPointsAdrAnc) {
      ui.notifications.warn("Adrénaline + Ancienneté ne peuvent dépasser 5.");
      formData["system.adrenaline.value"] = sys.adrenaline.value;
      formData["system.anciennete.value"] = sys.anciennete.value;
    }
    const reflexes = formData["system.caracteristiques.reflexes"] ?? sys.caracteristiques.reflexes;
    const min = COPS.initiativeMin[reflexes] ?? -2;
    if ((formData["system.combat.initiative"] ?? sys.combat.initiative) < min) {
      formData["system.combat.initiative"] = min;
    }
    return super._updateObject(event, formData);
  }
}
