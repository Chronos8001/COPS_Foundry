import { COPS } from "../config.mjs";
import { ItemSheetV1, TextEditorImpl } from "../compat.mjs";
import { profilActeur, verifierRequis } from "../stages.mjs";
import { CIBLES_STAGES, decrireEffetsStage } from "../effets-stages.mjs";

export class CopsItemSheet extends ItemSheetV1() {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["cops", "sheet", "item"],
      width: 560,
      height: 520
    });
  }

  get template() {
    return `systems/cops/templates/item/${this.item.type}.hbs`;
  }

  async getData(options) {
    const context = await super.getData(options);
    context.system = this.item.system;
    context.COPS = COPS;
    context.competences = Object.fromEntries(Object.entries(COPS.competences).map(([k, c]) => [k, c.label]));
    context.localisations = Object.entries(COPS.localisations).map(([key, l]) => ({
      key, label: l.label, actif: this.item.system.zones?.[key]
    }));
    context.chargements = { c: "Chargeur (2 tours)", b: "Balles (1 tour + 1/balle)", bd: "Bande (3 tours)", s: "Speedloader (2 tours)", "": "—" };
    if (this.item.type === "stage") {
      const sys = this.item.system;
      context.capacites = sys.capacites.map(c => ({ value: c, selected: c === sys.capacite }));
      context.cibles = (CIBLES_STAGES[sys.famille] ?? []).map(k => ({ value: k, label: COPS.competences[k].label, selected: k === sys.cible }));
      context.effets = decrireEffetsStage(this.item);
      // Vérification automatique des prérequis pour un stage porté par un personnage (hors stage lui-même).
      const actor = this.item.parent;
      if (actor && Object.keys(sys.requis ?? {}).length) {
        const profil = profilActeur(actor);
        profil.stages = actor.items.filter(i => i.type === "stage" && i.id !== this.item.id)
          .map(i => ({ famille: i.system.famille, niveau: i.system.niveau }));
        context.verif = verifierRequis(sys.requis, profil);
      }
    }
    context.descriptionHTML = await TextEditorImpl().enrichHTML(this.item.system.description, {
      secrets: this.item.isOwner, relativeTo: this.item
    });
    return context;
  }

  /** Changer la catégorie d'une arme met à jour la compétence par défaut. */
  async _updateObject(event, formData) {
    const cat = formData["system.categorie"];
    if (this.item.type === "arme" && cat && cat !== this.item.system.categorie) {
      formData["system.competence"] = COPS.competenceParCategorie[cat];
    }
    return super._updateObject(event, formData);
  }
}
