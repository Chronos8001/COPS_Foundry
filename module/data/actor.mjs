import { COPS } from "../config.mjs";
import { analyserStages } from "../effets-stages.mjs";

const { NumberField, StringField, SchemaField, HTMLField } = foundry.data.fields;

const entier = (initial = 0, opts = {}) =>
  new NumberField({ required: true, nullable: false, integer: true, initial, ...opts });

/** Données communes aux cops et aux PNJ. */
class PersonnageData extends foundry.abstract.TypeDataModel {
  /** PV de base avant ajout de Carrure × 3. */
  static PV_BASE = 10;
  /** Salaire mensuel par défaut. */
  static SALAIRE = 0;

  /** L'ancien champ texte identite.salaire devient finances.salaire (nombre). */
  static migrateData(source) {
    const ancien = source.identite?.salaire;
    if (typeof ancien === "string" && source.finances?.salaire === undefined) {
      const n = Number(ancien.replace(/[^\d]/g, ""));
      if (n) source.finances = { ...(source.finances ?? {}), salaire: n };
    }
    return super.migrateData(source);
  }

  static defineSchema() {
    const caracs = {};
    for (const key of Object.keys(COPS.caracteristiques)) {
      caracs[key] = entier(2, { min: 1, max: 5 });
    }

    const competences = {};
    for (const key of Object.keys(COPS.competences)) {
      competences[key] = new SchemaField({
        valeur: entier(0, { min: 0, max: 10 }),
        specialisation: new StringField({ initial: "" })
      });
    }

    return {
      caracteristiques: new SchemaField(caracs),
      competences: new SchemaField(competences),
      pv: new SchemaField({
        value: entier(26),
        bonus: entier(0)
      }),
      adrenaline: new SchemaField({ value: entier(0, { min: 0 }) }),
      anciennete: new SchemaField({ value: entier(0, { min: 0 }) }),
      combat: new SchemaField({
        attitude: entier(0, { min: -2, max: 2 }),
        initiative: entier(0, { min: -2, max: 2 })
      }),
      identite: new SchemaField({
        grade: new StringField({ initial: "" }),
        age: new StringField({ initial: "" }),
        origine: new StringField({ initial: "" }),
        affectation: new StringField({ initial: "" }),
        partenaire: new StringField({ initial: "" }),
        langues: new StringField({ initial: "" })
      }),
      finances: new SchemaField({
        /** Argent disponible, en $. */
        argent: entier(0),
        /** Salaire net mensuel, en $. */
        salaire: entier(this.SALAIRE, { min: 0 }),
        /** Revenus mensuels annexes (rente, actions…), en $. */
        revenus: entier(0, { min: 0 })
      }),
      pointsStage: entier(0, { min: 0 }),
      biographie: new HTMLField({ initial: "" }),
      relations: new HTMLField({ initial: "" })
    };
  }

  prepareDerivedData() {
    const c = this.caracteristiques;
    // Effets des stages (voir module/effets-stages.mjs).
    const stages = analyserStages(this.parent.items.contents);
    this.effetsStages = stages;
    this.pv.bonusStages = stages.pv;
    this.pv.max = this.constructor.PV_BASE + c.carrure * 3 + this.pv.bonus + stages.pv;
    this.finances.salaireTotal = Math.round(this.finances.salaire * (1 + stages.salairePct / 100)) + stages.salairePrime;
    this.pv.min = -this.pv.max;
    this.blesse = this.pv.value < this.pv.max / 2;
    this.inconscient = this.pv.value <= 0;
    this.mort = this.pv.value <= -this.pv.max;

    // Adrénaline et ancienneté partagent un plafond commun.
    this.adrenaline.max = COPS.maxPointsAdrAnc - this.anciennete.value;
    this.anciennete.max = COPS.maxPointsAdrAnc - this.adrenaline.value;

    // « Tir instinctif » : initiative minimale de -2 quels que soient les Réflexes.
    this.initiativeMin = stages.tirInstinctif ? -2 : (COPS.initiativeMin[c.reflexes] ?? -2);

    // Malus d'armure : cumul des armures équipées.
    let malus = 0, malusPerception = 0;
    for (const item of this.parent.items) {
      if (item.type !== "armure" || !item.system.equipee) continue;
      malus += item.system.malus;
      malusPerception += item.system.malusPerception;
    }
    this.malusArmure = malus;
    this.malusPerception = malusPerception;
  }
}

export class CopData extends PersonnageData {
  static PV_BASE = 20;
  static SALAIRE = 1500;
}

export class PnjData extends PersonnageData {
  static PV_BASE = 10;
}
