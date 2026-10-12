# COPS pour Foundry VTT

Système de jeu **non officiel** pour le jeu de rôle *COPS* (Los Angeles 2030), compatible Foundry VTT v12 et v13.

> Ce dépôt ne contient aucun texte du livre de règles. Il faut posséder le livre pour jouer.

## Fonctionnalités

- **Fiche de Cop / PNJ** : 7 caractéristiques, 27 compétences (seuil 9+ à 2+, spécialisations), PV calculés
  (20 + Carrure × 3 pour un cop, 10 + Carrure × 3 pour un PNJ), Adrénaline et Ancienneté (5 au total au maximum),
  points de stage, identité, relations et biographie.
- **Jets** : clic sur une caractéristique ou une compétence → Nd10 (N = caractéristique), réussite si ≥ seuil.
  Un 10 compte et se relance (réussite critique). Sans compétence, seul un 10 réussit, sans relance.
  Les malus sont appliqués automatiquement : blessé (< ½ PV, -1 dé), armure (actions physiques), casque (Perception).
- **Adrénaline** : case à cocher dans le dialogue (+1 dé, compétences marquées ⚡).
  **Ancienneté** : bouton sur la carte de chat d'un jet raté (+1 réussite, sans dépasser la difficulté).
- **Combat** : attitude et initiative choisies sur la fiche ; tir avec précision, distance, attitude de la cible,
  bout portant, malus des tirs multiples, rafale courte (Tir en rafales, 1 balle + marge, jusqu'à la VRC),
  décompte des munitions, rechargement.
  Localisation au d10, dés de puissance (relance des 1 pour l'Afrikaneer et le Compact Uni).
- **Dégâts** : ciblez le token touché (touche **T**), puis cliquez sur **Appliquer** dans le chat. Le système
  lance la protection de l'armure portée sur la zone touchée, ajoute les d6 de localisation et retire les PV.
  Un bouton lance ensuite le **jet de force d'arrêt** (Carrure ou Sang-froid, 6+, difficulté FA + localisation).
- **Suivi de combat** : l'initiative la plus basse agit en premier ; en cas d'égalité, les Réflexes
  puis l'attitude la plus agressive départagent.
- **Compendiums** : armes à feu, armes anciennes, armes blanches, explosifs, protections et dotation du COPS.

Les poursuites, les interrogatoires, le tir de couverture, les dommages collatéraux et les stages se gèrent
à la main : jets avec le dialogue générique, et stages comme objets descriptifs sur la fiche.

## Installation sur The Forge

1. Sur The Forge, ouvrez la page de configuration de Foundry (**Game Systems** → **Install System**).
2. Collez l'URL du manifeste en bas de la fenêtre :

   ```
   https://github.com/Chronos8001/COPS_Foundry/releases/latest/download/system.json
   ```

3. Cliquez sur **Install**, puis créez un monde avec le système **COPS**.

Vous pouvez aussi passer par le **Bazaar** de Forge (*Install from manifest URL*) avec la même adresse.
Les mises à jour se font ensuite depuis Foundry (bouton *Update*).

## Installation sur Foundry en local

Même URL de manifeste dans **Systèmes de jeu → Installer un système**.

Pour le développement, compilez les compendiums puis créez un lien vers le dépôt :

```powershell
npm install
npm run build:packs
New-Item -ItemType Junction -Path "$env:LOCALAPPDATA\FoundryVTT\Data\systems\cops" -Target "C:\Users\antoi\COPS_Foundry"
```

Le dossier installé doit s'appeler `cops`, comme l'`id` du `system.json`.

## Publier une nouvelle version

1. Changez `version` dans `system.json` et `package.json`.
2. Commitez et poussez sur `main`.
3. Sur GitHub, créez une **Release** avec un tag `vX.Y.Z` (par ex. `v0.1.0`).

Le workflow `.github/workflows/release.yml` compile les compendiums, met à jour la version et l'URL de
téléchargement, puis joint `cops.zip` et `system.json` à la release. L'URL du manifeste
`…/releases/latest/download/system.json` pointe toujours vers la dernière version.

## Structure

```
system.json            manifeste du système
module/cops.mjs        point d'entrée (enregistrement des modèles, fiches, hooks)
module/config.mjs      constantes de règles (caractéristiques, compétences, localisations…)
module/data/           modèles de données (acteurs, objets)
module/dice.mjs        jets, attaques, dégâts, force d'arrêt, ancienneté
module/documents/      combat (ordre d'initiative COPS)
module/sheets/         fiches d'acteur et d'objet
templates/             gabarits Handlebars
styles/cops.css        apparence
lang/                  traductions
tools/                 données et compilation des compendiums
```
