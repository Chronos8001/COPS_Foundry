import { COPS } from "../config.mjs";

const { NumberField, StringField, SchemaField, HTMLField, BooleanField } = foundry.data.fields;

const entier = (initial = 0, opts = {}) =>
  new NumberField({ required: true, nullable: false, integer: true, initial, ...opts });

class ObjetData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      description: new HTMLField({ initial: "" }),
      prix: new StringField({ initial: "" })
    };
  }
}

export class ArmeData extends ObjetData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      categorie: new StringField({ initial: "poing", choices: Object.keys(COPS.categoriesArme) }),
      competence: new StringField({ initial: "armePoing", choices: Object.keys(COPS.competences) }),
      specialisation: new StringField({ initial: "" }),
      precision: entier(0),
      puissance: entier(2, { min: 0 }),
      forceArret: entier(1, { min: 0 }),
      /** Valeur de rafale courte (0 = pas de rafale). */
      vrc: entier(0, { min: 0 }),
      portee: entier(20, { min: 0 }),
      /** Valeur de couverture (0 = tir de couverture impossible). */
      vc: entier(0, { min: 0 }),
      cadence: entier(1, { min: 0 }),
      munitions: new SchemaField({
        value: entier(0, { min: 0 }),
        max: entier(0, { min: 0 })
      }),
      /** c : chargeur, b : balles, bd : bande, s : speedloader. */
      chargement: new StringField({ initial: "c", choices: ["c", "b", "bd", "s", ""] }),
      /** Relance les 1 sur les dés de dommages (Colt Afrikaneer, Compact Uni). */
      relanceUn: new BooleanField({ initial: false }),
      /** Dommages fixes non localisés (explosifs) ; formule libre, ex. « 2d6+2 ». */
      dommagesSpeciaux: new StringField({ initial: "" }),
      equipee: new BooleanField({ initial: true })
    };
  }

  get estDistance() {
    return this.categorie !== "contact";
  }
}

export class ArmureData extends ObjetData {
  static defineSchema() {
    const zones = {};
    for (const key of Object.keys(COPS.localisations)) zones[key] = new BooleanField({ initial: false });
    return {
      ...super.defineSchema(),
      /** Protection : formule « XdY+Z » ou « +Z ». */
      protection: new StringField({ initial: "1d6" }),
      zones: new SchemaField(zones),
      /** Malus en dés aux actions physiques (valeur positive). */
      malus: entier(0, { min: 0 }),
      malusPerception: entier(0, { min: 0 }),
      equipee: new BooleanField({ initial: false })
    };
  }

  /** Décompose la protection en nombre de d6 et bonus fixe. */
  get protectionParsee() {
    const m = /^\s*(?:(\d+)\s*d\s*6)?\s*(?:\+?\s*(\d+))?\s*$/i.exec(this.protection ?? "");
    if (!m) return { des: 0, bonus: 0 };
    return { des: Number(m[1] ?? 0), bonus: Number(m[2] ?? 0) };
  }
}

export class EquipementData extends ObjetData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      quantite: entier(1, { min: 0 })
    };
  }
}

export class StageData extends ObjetData {
  static defineSchema() {
    return {
      ...super.defineSchema(),
      niveau: entier(1, { min: 1, max: 3 }),
      prerequis: new StringField({ initial: "" }),
      cumul: new StringField({ initial: "" })
    };
  }
}
