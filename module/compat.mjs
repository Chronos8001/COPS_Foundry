/** Petits raccourcis pour rester compatible Foundry v12 et v13 (espaces de noms déplacés en v13). */

export const renderTemplate = (...args) =>
  (foundry.applications.handlebars?.renderTemplate ?? globalThis.renderTemplate)(...args);

export const loadTemplates = (...args) =>
  (foundry.applications.handlebars?.loadTemplates ?? globalThis.loadTemplates)(...args);

export const TextEditorImpl = () => foundry.applications.ux?.TextEditor?.implementation ?? globalThis.TextEditor;

export const ActorSheetV1 = () => foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet;
export const ItemSheetV1 = () => foundry.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet;

export const ActorsCollection = () => foundry.documents?.collections?.Actors ?? globalThis.Actors;
export const ItemsCollection = () => foundry.documents?.collections?.Items ?? globalThis.Items;

export const DialogV2 = () => foundry.applications.api.DialogV2;

/** Lit les champs d'un formulaire de dialogue sous forme d'objet simple. */
export function lireFormulaire(form) {
  const data = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === "checkbox") data[el.name] = el.checked;
    else if (el.type === "number" || el.dataset.dtype === "Number") data[el.name] = Number(el.value || 0);
    else data[el.name] = el.value;
  }
  return data;
}
