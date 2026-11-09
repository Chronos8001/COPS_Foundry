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
- **Compendiums** : armes à feu, armes anciennes, armes blanches, explosifs, protections, dotation du COPS
  et **stages** (62 stages des niveaux 1 à 3, rangés par niveau, avec prérequis, cumul, bonus et capacités spéciales).
- **Assistant de création** (bouton **Création** dans la barre de titre d'une fiche de cop, ouvert automatiquement
  à la création d'un cop vierge — désactivable dans les paramètres) :
  - 21 points de caractéristiques (2 à 5, un seul 5) ;
  - compétences de départ du COPS + 10 points (améliorations et nouvelles compétences), spécialisations ;
  - origine sociale et son avantage (arme, argent, véhicule, rente…), études (2 points), entrée au COPS
    (Adrénaline / Ancienneté), relations à préciser ;
  - 2 stages de niveau 1 avec vérification automatique des prérequis, choix de la capacité spéciale
    et de la compétence visée ;
  - dotation complète (uniforme, masque, tonfa, Compact ou Colt, holster…, trousse et kit prêtés si les
    compétences le permettent) ;
  - salaire (1 500 $ : Détective échelon I, rang 2), revenus annexes et argent de départ
    (un mois de salaire par défaut, le livre ne fixant pas de somme ; modifiable) ;
  - bouton **Tout aléatoire** pour tirer un personnage complet et valide, puis l'ajuster.
- **Finances** : salaire, revenus annexes et argent sur la fiche ; bouton **Paie** pour verser le mois
  (primes de stage comprises).
- **Effets des stages automatisés** (selon les stages portés et la capacité choisie) :
  - **dé bleu** (affiché en bleu sur la carte, une réussite compte double) : automatique quand il ne dépend que de
    la compétence (Criminalistique, Commando, Regard de flic, Premier de la classe…), sinon case à cocher dans
    le dialogue de jet (Géopolitique, Pot de fleurs, Infiltration, Endurance…) ;
  - **relance d'un dé en échec** (Technique d'interrogatoire sur la compétence visée, Ricardo Tubbs) ;
  - **dés bonus** sous condition (Imperturbable, Évasion, Esprit de ruche, Zanshin, Suceur) ;
  - **Adrénaline** sur Instinct de flic (Combat de localité), plusieurs points par jet (Hyper réactif) ;
  - **Ancienneté doublée** sur les jets physiques et de Sang-froid (Opération ninja blanc) ;
  - **Petit génie** (niveau 7+ minimum), **Solide comme l'acier** (dé bleu en force d'arrêt) ;
  - **attaques** : bonus de dommages (Tir, Gestion des foules, Tonfa) et de localisation (Tir niv. 2), répartis
    avec des boutons sur la carte dans la limite de la marge (cumulables avec Tir niv. 3) ; Point faible ;
    tirs visés (Tir incapacitant, Sniper) ; Rafale maîtrisée ;
  - **permanents** : PV de « Gonflette », primes de salaire (Rond-de-cuir, Petit génie) versées par le bouton Paie,
    initiative de Tir instinctif (minimum −2, égalités gagnées).

  La fiche d'un stage indique ce qui est automatisé et sur quoi. Son champ « Compétence visée / domaine »
  (Tir : arme de poing ou d'épaule ; Interrogatoire : Intimidation, Éloquence ou Rhétorique) restreint ses effets.

Restent à gérer à la main : poursuites, tir de couverture, dommages collatéraux, corps à corps à mains nues
(Frappe), et les capacités narratives des stages (Mémoire photographique, Carambole, Caïd…).

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
module/config.mjs      constantes de règles (caractéristiques, compétences, création de personnage…)
module/stages.mjs      prérequis des stages (texte et vérification)
module/effets-stages.mjs  effets automatisés des stages sur les jets
module/apps/           assistant de création de cops
module/data/           modèles de données (acteurs, objets)
module/dice.mjs        jets, attaques, dégâts, force d'arrêt, ancienneté
module/documents/      combat (ordre d'initiative COPS)
module/sheets/         fiches d'acteur et d'objet
templates/             gabarits Handlebars
styles/cops.css        apparence
lang/                  traductions
tools/                 données (donnees.mjs, stages.mjs) et compilation des compendiums
```
