import { COPS } from "../config.mjs";

const { NumberField, StringField, SchemaField, HTMLField } = foundry.data.fields;

const entier = (initial = 0, opts = {}) =>
  new NumberField({ required: true, nullable: false, integer: true, initial, ...opts });

/** Données communes aux cops et aux PNJ. */
class PersonnageData extends foundry.abstract.TypeDataModel {
  /** PV de base avant ajout de Carrure × 3. */
  static PV_BASE = 10;

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
        langues: new StringField({ initial: "" }),
        salaire: new StringField({ initial: "" })
      }),
      pointsStage: entier(0, { min: 0 }),
      biographie: new HTMLField({ initial: "" }),
      relations: new HTMLField({ initial: "" })
    };
  }

  prepareDerivedData() {
    const c = this.caracteristiques;
    this.pv.max = this.constructor.PV_BASE + c.carrure * 3 + this.pv.bonus;
    this.pv.min = -this.pv.max;
    this.blesse = this.pv.value < this.pv.max / 2;
    this.inconscient = this.pv.value <= 0;
    this.mort = this.pv.value <= -this.pv.max;

    // Adrénaline et ancienneté partagent un plafond commun.
    this.adrenaline.max = COPS.maxPointsAdrAnc - this.anciennete.value;
    this.anciennete.max = COPS.maxPointsAdrAnc - this.adrenaline.value;

    this.initiativeMin = COPS.initiativeMin[c.reflexes] ?? -2;

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
}

export class PnjData extends PersonnageData {
  static PV_BASE = 10;
}
