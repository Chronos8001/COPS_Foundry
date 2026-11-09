/**
 * Compendium des stages (niveaux 1 à 3).
 * Sources : livre de base (p. 156-164) et la liste des stages compilée par la communauté.
 * Les textes sont des résumés de règles reformulés, pas des extraits.
 *
 * Champs : niveau, famille, nom, requis (voir module/stages.mjs), cumulable, cumul, bonus, capacites [[nom, effet]].
 */
import { formaterRequis } from "../module/stages.mjs";

const DE_BLEU = "1 dé bleu";

const STAGES = [
  /* ============================ NIVEAU 1 ============================ */
  {
    niveau: 1, famille: "artMartial", nom: "Art martial niv. 1 « Aware de ton body »",
    requis: { caracs: { carrure: 3 }, competences: { corpsACorps: 6 } },
    cumul: "Non.",
    bonus: "Avec une heure d'entraînement par jour : +1 point de récupération tous les deux jours après une blessure, et 1 dé bleu de Carrure aux jets de résistance aux maladies et aux poisons.",
    capacites: [
      ["Évasion", "+1 dé à tous les jets pour rompre une immobilisation."],
      ["Iron fist", "Contre un objet inanimé (porte, mur, vitre), compte comme ayant +1 en Carrure, sans se blesser."],
      ["Méditation", "Récupère 1 point d'Adrénaline après 3 h de méditation, ou 1 point d'Ancienneté après 2 h."],
      ["Roulade", "Quand il subit une projection : dommages divisés par 2 (arrondi inférieur) et FA réduite de 2 (minimum 0)."]
    ]
  },
  {
    niveau: 1, famille: "dea", nom: "DEA niv. 1 « Poussière d'ange »",
    requis: { caracs: { education: 3 }, competences: { connaissance: [8, "drogue"] } },
    cumul: "Non.",
    capacites: [
      ["Collecteur d'informations", "Quand il cherche des informations sur la drogue, ses interlocuteurs sont considérés comme ayant +1 niveau dans ce domaine (au minimum −3 s'ils n'y connaissent rien)."]
    ]
  },
  {
    niveau: 1, famille: "cohesion", nom: "Cohésion « Grande gueule »",
    requis: { competences: { bureaucratie: 7, psychologie: 7 }, points: { anciennete: 1, adrenaline: 1 } },
    cumul: "Non.",
    capacites: [
      ["Commandement", "Chef de groupe uniquement : 1 point d'Ancienneté et 1 point d'Adrénaline supplémentaires par séance, à donner à ses équipiers (jamais pour lui-même, non reportables)."]
    ]
  },
  {
    niveau: 1, famille: "combatLocalite", nom: "Combat de localité niv. 1 « Des yeux dans le dos »",
    requis: { caracs: { sangfroid: 3 }, competences: { athletisme: 6, instinctDeFlic: 6 } },
    cumulable: true, cumul: "Oui, pour les capacités spéciales uniquement.",
    bonus: "Peut dépenser de l'Adrénaline sur les jets d'Instinct de flic (1 point par jet, sauf capacité contraire).",
    capacites: [
      ["Planification", "Intervention correctement planifiée : +1 point d'Ancienneté pour la durée de l'intervention (utilisable ou transférable)."],
      ["Mouvement tactique", "Intervention correctement planifiée : +1 point d'Adrénaline pour la durée de l'intervention (utilisable ou transférable)."]
    ]
  },
  {
    niveau: 1, famille: "communication", nom: "Communication médiatique niv. 1 « Respect du culte »",
    requis: {
      caracs: { education: 3 }, competences: { rhetorique: 7 },
      autre: "avoir résolu une affaire de déprogrammation à la place de l'OCOB, ou brillé lors d'une apparition TV sur un sujet sensible"
    },
    cumul: "Non.",
    capacites: [
      ["Maîtrise de la bienséance juridique", "Ses déclarations aux médias n'exposent jamais sa hiérarchie à des poursuites (diffamation, discrimination…)."]
    ]
  },
  {
    niveau: 1, famille: "conduite", nom: "Conduite niv. 1 « Autotamponneuse »",
    requis: { caracs: { coordination: 3 }, competences: { conduite: [6, "voiture"] } },
    cumul: "Non.",
    capacites: [
      ["As de la route", "En poursuite, ignore la perte de son premier dé (le deuxième et les suivants se perdent normalement)."]
    ]
  },
  {
    niveau: 1, famille: "criminalistique", nom: "Criminalistique niv. 1 « Crâne d'œuf »",
    requis: { caracs: { perception: 3 }, competences: { sceneDeCrime: 6 } },
    cumul: "Non.",
    bonus: `${DE_BLEU} aux jets scientifiques et de connaissance : Connaissance, Électronique, Informatique, Mécanique, Scène de crime.`,
    capacites: [
      ["Mémoire photographique", "Après 5 minutes d'observation d'un lieu, jet d'Instinct de flic/Perception (1) : s'en souvient parfaitement 24 h, +24 h par point de marge."]
    ]
  },
  {
    niveau: 1, famille: "linguistique", nom: "Multiplicités linguistiques « Drague »",
    requis: { caracs: { education: 3 } },
    cumulable: true, cumul: "Oui, pour le bonus.",
    bonus: "Suivi assidûment (deux à trois fois par an) : une nouvelle langue au choix (davantage pour les langues difficiles, au gré du MJ).",
    capacites: [
      ["Linguiste", "Après 5 minutes d'écoute, comprend le sens général d'une conversation dans une langue inconnue (à l'oral seulement)."]
    ]
  },
  {
    niveau: 1, famille: "frappe", nom: "Frappe niv. 1 « Punching ball »",
    requis: { caracs: { carrure: 3 }, competences: { corpsACorps: [6, "coups"] } },
    cumulable: true, cumul: "Oui, jusqu'à +3.",
    bonus: "+1 aux dommages des coups de poing par stage suivi (jamais en projection ni en immobilisation), sans dépasser la marge de réussite de l'attaque."
  },
  {
    niveau: 1, famille: "geopolitique", nom: "Géopolitique globale « Sucer des huîtres, lécher des moules »",
    requis: { options: [{ caracs: { charme: 4 } }, { caracs: { education: 4 } }] },
    cumulable: true, cumul: "Oui, une fois par milieu (haute finance, politique, showbiz…).",
    bonus: `${DE_BLEU} aux jets de Connaissance du milieu choisi.`,
    capacites: [
      ["Culture mondaine", "Relation de niveau 1 avec tous les représentants du milieu choisi (le MJ peut faire des exceptions)."]
    ]
  },
  {
    niveau: 1, famille: "foules", nom: "Gestion des foules « Matraquage »",
    requis: { caracs: { sangfroid: 3 }, competences: { intimidation: 6 } },
    cumulable: true, cumul: "Oui, jusqu'à +3.",
    bonus: "+1 aux dommages avec une arme de contact par stage suivi, sans dépasser la marge de réussite de l'attaque.",
    capacites: [
      ["Imperturbable", "+1 dé aux jets de Sang-froid pour garder son calme en situation de stress (émeute, interrogatoire, intimidation…)."]
    ]
  },
  {
    niveau: 1, famille: "procedures", nom: "Procédures de communication du LAPD niv. 1 « J'embrasse… »",
    requis: { caracs: { sangfroid: 3 }, competences: { bureaucratie: 6 } },
    cumul: "Non.",
    bonus: "À la fin de chaque séance, jet de Bureaucratie/Charme (4) sans Adrénaline : +1 point d'expérience par point de marge.",
    capacites: [
      ["Suceur", "+1 dé en interaction sociale avec le personnel administratif du LAPD, mais −1 dé permanent avec les flics de terrain (le personnel scientifique n'est pas concerné)."]
    ]
  },
  {
    niveau: 1, famille: "navigation", nom: "Navigation niv. 1 « In the Navy! »",
    requis: { caracs: { coordination: 3 }, competences: { pilotage: [8, "bateau"] } },
    cumul: "Non.",
    capacites: [
      ["Ricardo Tubbs spécial", "Relance un dé en échec à chaque jet de Pilotage [bateau], poursuites comprises."]
    ]
  },
  {
    niveau: 1, famille: "menottage", nom: "Menottage « Spécial pervers »",
    requis: { caracs: { reflexes: 3, coordination: 3 }, competences: { corpsACorps: 6 } },
    cumul: "Non.",
    capacites: [
      ["Menottage", "Après une immobilisation réussie, opposition de Réflexes avec +1 dé pour passer une menotte (poignet, cheville ou point fixe) ; la seconde au tour suivant, avec +2 dés si l'immobilisation tient toujours."]
    ]
  },
  {
    niveau: 1, famille: "partenariat", nom: "Partenariat niv. 1 « Foot-bière-chips »",
    requis: { competences: { instinctDeFlic: 7, psychologie: 8 } },
    cumul: "Non.",
    capacites: [
      ["Esprit de ruche", "Si au moins deux membres du groupe l'ont et agissent ensemble à portée de vue ou de voix : +2 dés aux jets de Perception et d'Instinct de flic en combat (non cumulatif)."]
    ]
  },
  {
    niveau: 1, famille: "protection", nom: "Protection des personnalités niv. 1 « Pot de fleurs »",
    requis: { caracs: { charme: 3 } },
    cumulable: true, cumul: "Oui, une fois par quartier de L.A.",
    bonus: `${DE_BLEU} aux jets de Connaissance du quartier où s'est déroulé le stage.`,
    capacites: [
      ["Ami du patron", "Dans ce quartier : petits services offerts (repas, verre, nuit…) et −15 % sur les achats importants. En abuser donne vite une réputation de ripou."]
    ]
  },
  {
    niveau: 1, famille: "rh", nom: "Ressources humaines « Rond-de-cuir »",
    requis: { caracs: { charme: 3 }, competences: { bureaucratie: 6 } },
    cumul: "Non.",
    bonus: "Salaire de base augmenté de 10 % de façon permanente.",
    capacites: [
      ["Carambole", "Quand un autre PJ obtient du matériel ou une promotion, jet de Bureaucratie/Sang-froid (3 à 5, selon le MJ) pour l'obtenir à sa place. Permet aussi de « subtiliser » un stage de niveau 1 ou 2 à une autre équipe."]
    ]
  },
  {
    niveau: 1, famille: "sensibilisation", nom: "Sensibilisation culturelle niv. 1 « Serrer des mains… »",
    requis: {
      caracs: { charme: 3 }, competences: { connaissance: 7 },
      autre: "la Connaissance doit porter sur une culture d'un quartier précis"
    },
    cumulable: true, cumul: "Oui, une fois par quartier et par culture.",
    bonus: `${DE_BLEU} aux jets de Connaissance de cette communauté (ex. : les Latinos de Venice Beach).`,
    capacites: [
      ["Oreille de la rue", "À chaque séance, le MJ lui transmet les rumeurs du quartier et de la communauté, utiles ou non (niveau d'un indic de niveau 1)."]
    ]
  },
  {
    niveau: 1, famille: "sportExtreme", nom: "Sport extrême niv. 1 « Urban Street Runner »",
    requis: { caracs: { reflexes: 3 }, competences: { athletisme: 7 } },
    cumul: "Non.",
    capacites: [
      ["Urban runner", "En poursuite à pied, peut gagner 1 dé de poursuite supplémentaire tous les deux tours (toujours un dé noir)."]
    ]
  },
  {
    niveau: 1, famille: "survie", nom: "Survie niv. 1 « Traverser la rue »",
    requis: { caracs: { sangfroid: 3 }, competences: { premiersSecours: 7 } },
    cumulable: true, cumul: "Oui.",
    capacites: [
      ["Sens de l'orientation", "Sait toujours où se trouve le nord, à quelques degrés près."],
      ["Sens du temps", "Connaît toujours la date et l'heure, à cinq minutes près."]
    ]
  },
  {
    niveau: 1, famille: "interrogatoire", nom: "Technique d'interrogatoire niv. 1 « Le bon, la brute et le truand »",
    requis: {
      options: [
        { caracs: { sangfroid: 3 }, competences: { intimidation: 6 } },
        { caracs: { charme: 3 }, competences: { eloquence: 6 } },
        { caracs: { education: 3 }, competences: { rhetorique: 6 } }
      ]
    },
    cumulable: true, cumul: "Oui, un stage par compétence d'interrogatoire.",
    bonus: "Avec la compétence d'interrogatoire choisie : une relance par jet d'un dé en échec (pas sur les dés relancés après un critique)."
  },
  {
    niveau: 1, famille: "tir", nom: "Tir niv. 1 « Pat Garrett »",
    requis: { caracs: { coordination: 3 }, options: [{ competences: { armePoing: 6 } }, { competences: { armeEpaule: 6 } }] },
    cumulable: true, cumul: "Oui, jusqu'à +3 par compétence d'arme.",
    bonus: "+1 aux dommages avec la compétence d'arme choisie par stage suivi, sans dépasser la marge de réussite du tir.",
    capacites: [
      ["Tir dissuasif", "+2 dés aux tirs de couverture."],
      ["Tir instinctif", "Si sa seule action est de tirer, initiative minimale −2 quels que soient ses Réflexes ; en dégainant, initiative minimale réduite de 1 (minimum −2). Remporte toujours les égalités d'initiative (sauf contre un autre tireur instinctif : tirs simultanés)."],
      ["Tir incapacitant", "Augmente de 2 la difficulté du tir : s'il réussit, touche le bras ou la jambe de son choix."]
    ]
  },
  {
    niveau: 1, famille: "tonfa", nom: "Tonfa « Tonton bâton »",
    requis: { caracs: { reflexes: 3 }, competences: { armeContact: [6, "matraque"] } },
    cumulable: true, cumul: "Oui, jusqu'à +3.",
    bonus: "+1 aux dommages au tonfa par stage suivi, sans dépasser la marge de réussite de l'attaque.",
    capacites: [
      ["Immobilisation", "Attaque au tonfa avec +1 dé : la cible est immobilisée (ni dommages ni FA). Pour se libérer, elle perd 2 PV et tente une opposition (Arme de contact [matraque] avec +1 dé contre Corps à corps) ; l'égalité maintient la prise."],
      ["Parade", "Au corps à corps avec un tonfa, si l'adversaire l'emporte avec une marge de 1 ou 2, l'attaque est parée (aucun dommage de part et d'autre)."]
    ]
  },
  {
    niveau: 1, famille: "sportif", nom: "Sportif « Gonflette »",
    requis: { caracs: { carrure: 3 } },
    cumulable: true, cumul: "Oui, deux fois.",
    bonus: "+3 points de vie permanents par stage (+6 au maximum).",
    capacites: [
      ["Bonne condition physique", "Carrure +1 (maximum 5) tant qu'il fait 2 h de sport par jour ; perdu après une semaine d'arrêt, regagné après un mois de reprise."]
    ]
  },
  {
    niveau: 1, famille: "nadiv", nom: "NADIV niv. 1 « Dope junky »",
    requis: { caracs: { perception: 3 }, competences: { connaissance: [8, "drogue"] } },
    cumul: "Non.",
    capacites: [
      ["Sentir le dragon", "Jet de Connaissance [drogues]/Perception (1) : identifie une caractéristique d'une drogue qu'il a en main (effet, nom, addiction…), +1 par point de marge."]
    ]
  },

  /* ============================ NIVEAU 2 ============================ */
  {
    niveau: 2, famille: "commando", nom: "Commando niv. 1 « Opération ninja »",
    requis: { caracs: { coordination: 4, reflexes: 4 }, competences: { athletisme: 5 } },
    cumulable: true, cumul: "Oui, deux fois (nouvelle capacité seulement, pas de cumul du bonus).",
    bonus: `${DE_BLEU} aux jets d'Athlétisme.`,
    capacites: [
      ["Hyper réactif", "N'est plus limité à 1 point d'Adrénaline par jet : peut en dépenser autant qu'il veut."],
      ["Interception", "Une fois initiatives et attitudes choisies, 1 point d'Adrénaline pour agir juste avant le combattant qui le précède (chacun garde ses modificateurs)."],
      ["Esquive acrobatique", "En se déplaçant : attitude Ultra-violente avec seulement −1 de malus, ou Agressive sans malus (bonus inchangés)."]
    ]
  },
  {
    niveau: 2, famille: "artMartial", nom: "Art martial niv. 2 « Jacky Chan »",
    requis: { stages: ["artMartial:1"], caracs: { reflexes: 4 }, competences: { corpsACorps: 5 } },
    cumulable: true, cumul: "Oui, pour les capacités spéciales.",
    capacites: [
      ["Combat acrobatique", "Le bonus de surnombre de ses adversaires est divisé par 2 (arrondi inférieur)."],
      ["Coups maîtrisés", "Peut réduire à volonté les dommages qu'il inflige au contact ; ses projections ont FA +1."],
      ["Enchaînement", "1 point d'Adrénaline ou d'Ancienneté, annoncé avant l'attaque : s'il n'a pas été blessé ce tour, porte une attaque de contact supplémentaire en fin de tour ; la cible ne peut que se défendre."],
      ["Maître des clés", "Ses immobilisations coûtent 4 PV (au lieu de 2) à la victime pour tenter de se libérer, et 1 PV de plus en cas d'échec."],
      ["Souplesse", "En sacrifiant définitivement 1 point d'Ancienneté (rachetable) : se libère de toute entrave munie d'un mécanisme d'ouverture."]
    ]
  },
  {
    niveau: 2, famille: "infiltration", nom: "Infiltration niv. 1 « Atelier théâtre »",
    requis: { caracs: { sangfroid: 4 }, competences: { deguisement: 5 } },
    cumulable: true, cumul: "Oui, une fois par type de criminalité (dealer, prostitution…) ou de milieu (mafia russe, Triades…).",
    bonus: `${DE_BLEU} aux jets de Connaissance du milieu étudié et pour résister à un interrogatoire.`,
    capacites: [
      ["Béni des dieux", "1 point d'Ancienneté : fait croire un énorme mensonge (crédibilité et cibles à l'appréciation du MJ)."]
    ]
  },
  {
    niveau: 2, famille: "dea", nom: "DEA niv. 2 « Dealer mon ami »",
    requis: { stages: ["dea:1"], caracs: { charme: 4 }, competences: { connaissance: [6, "drogue"] } },
    cumul: "Non.",
    capacites: [
      ["Trombinoscope", "Jet d'Instinct de flic/Éducation (2) : identifie précisément l'organisation criminelle d'un individu croisé (famille, gang, cartel…)."]
    ]
  },
  {
    niveau: 2, famille: "combatLocalite", nom: "Combat de localité niv. 2 « Monsieur Propre »",
    requis: { stages: ["combatLocalite:1"], caracs: { reflexes: 4, sangfroid: 4 }, competences: { discretion: 5 } },
    cumul: "Non.",
    bonus: "−1 à tous ses jets sur la table des dommages collatéraux.",
    capacites: [
      ["Nettoyage", "Procédure « Frapper avant d'entrer » respectée : l'ouvreur se met à couvert juste après avoir ouvert (Planqué) ; en seconde position, il peut lancer un tir de couverture sans tenir compte de l'initiative."]
    ]
  },
  {
    niveau: 2, famille: "communication", nom: "Communication médiatique niv. 2 « Expert en communication »",
    requis: { stages: ["communication:1"], caracs: { education: 3 }, competences: { rhetorique: 6, connaissance: [6, "secte|religion"] } },
    cumul: "Non.",
    bonus: `${DE_BLEU} pour démonter une argumentation sectaire (compétence sociale, Connaissance ou Sang-froid).`,
    capacites: [
      ["Crédibilité", "La hiérarchie lui confie volontiers les affaires de sectes ; −1 à la difficulté des jets de Bureaucratie si on veut l'en écarter."]
    ]
  },
  {
    niveau: 2, famille: "conduite", nom: "Conduite niv. 2 « Stock car »",
    requis: { stages: ["conduite:1"], caracs: { reflexes: 4 }, competences: { conduite: [5, "voiture"] } },
    cumul: "Non.",
    bonus: "En cas de crash : −1 dé de dommages aux personnes et −1 point de dommages structurels au véhicule.",
    capacites: [
      ["Turbo", "En poursuite, peut gagner 1 dé noir supplémentaire tous les trois tours."]
    ]
  },
  {
    niveau: 2, famille: "criminalistique", nom: "Criminalistique niv. 2 « Culture générale »",
    requis: { stages: ["criminalistique:1"], caracs: { education: 4 }, competences: { sceneDeCrime: 5 } },
    cumul: "Non.",
    capacites: [
      ["Petit génie", "Niveau 7+ au minimum en Connaissance scientifique, Électronique, Informatique, Mécanique et Scène de crime (pour progresser au-delà, payer depuis le niveau réel). Prime permanente de 100 $ par mois."]
    ]
  },
  {
    niveau: 2, famille: "frappe", nom: "Frappe niv. 2 « Petit scarabée »",
    requis: { stages: ["frappe:1"], caracs: { reflexes: 4 }, competences: { corpsACorps: [5, "coups"] } },
    cumulable: true, cumul: "Oui, jusqu'à ±3.",
    bonus: "±1 au jet de localisation des coups à mains nues par stage, appliqué au choix après le jet, sans dépasser la marge de réussite.",
    capacites: [
      ["Endurance", `${DE_BLEU} aux jets de résistance de Carrure ou Sang-froid (drogue, sommeil…), hors encaissement.`],
      ["Solide comme l'acier", `${DE_BLEU} aux jets d'encaissement (Carrure ou Sang-froid).`]
    ]
  },
  {
    niveau: 2, famille: "procedures", nom: "Procédures de communication du LAPD niv. 2 « … J'avale… »",
    requis: { stages: ["procedures:1"], caracs: { education: 4 }, competences: { bureaucratie: 5 } },
    cumul: "Non.",
    bonus: "À la fin de chaque scénario, jet de Bureaucratie/Éducation (4) sans Adrénaline : +1 point de stage personnel par point de marge (perdu s'il n'est pas dépensé).",
    capacites: [
      ["Grand maître de la paperasserie", `${DE_BLEU} aux jets pour obtenir crédits, matériel ou renforts.`]
    ]
  },
  {
    niveau: 2, famille: "navigation", nom: "Navigation niv. 2 « Oh mon batoooo ! »",
    requis: { stages: ["navigation:1"], caracs: { coordination: 3, reflexes: 4 }, competences: { pilotage: [6, "bateau"] } },
    cumul: "Non.",
    bonus: "Autorisé à intervenir en milieu aquatique. En cas de crash : −1 dé de dommages aux personnes et −1 point de dommages structurels par dé.",
    capacites: [
      ["Capitaine Crochet", "Bloque la barre pour garder le cap et aborde un autre bateau sans malus."]
    ]
  },
  {
    niveau: 2, famille: "partenariat", nom: "Partenariat niv. 2 « Pizza party »",
    requis: { stages: ["partenariat:1"], competences: { instinctDeFlic: 5 } },
    cumul: "Non.",
    capacites: [
      ["Janus", "Si les deux partenaires l'ont : ils échangent librement Adrénaline et Ancienneté chaque tour tant qu'ils restent en contact (radio, voix, vue)."]
    ]
  },
  {
    niveau: 2, famille: "protection", nom: "Protection des personnalités niv. 2 « Pot de chambre »",
    requis: { stages: ["protection:1"], caracs: { charme: 4 } },
    cumulable: true, cumul: "Oui, pour les capacités spéciales.",
    bonus: `${DE_BLEU} aux jets d'Éloquence (interrogatoires compris).`,
    capacites: [
      ["Anodin", "Dans une foule d'au moins vingt personnes, +2 à la difficulté pour le repérer (filature, planque)."],
      ["Physionomiste", "Face à un criminel déjà arrêté, jet d'Instinct de flic/Éducation (2) : se souvient d'un élément de son dossier, +1 par point de marge."]
    ]
  },
  {
    niveau: 2, famille: "psychologie", nom: "Psychologie criminelle « Vol au-dessus d'un nid de coucous »",
    requis: { caracs: { perception: 4, education: 4 }, competences: { psychologie: 5 } },
    cumulable: true, cumul: "Oui, deux fois.",
    bonus: `${DE_BLEU} aux jets de Rhétorique (interrogatoires compris).`,
    capacites: [
      ["Profilage", "Jet de Psychologie/Éducation (3) : une information détaillée sur l'auteur d'un crime par point de marge."],
      ["Regard de flic", `${DE_BLEU} aux jets d'Instinct de flic.`]
    ]
  },
  {
    niveau: 2, famille: "sensibilisation", nom: "Sensibilisation culturelle niv. 2 « … Et caresser les chiens »",
    requis: {
      stages: ["sensibilisation:1"], caracs: { charme: 4 }, competences: { connaissance: 5 },
      autre: "même milieu qu'un stage de sensibilisation culturelle de niveau 1"
    },
    cumulable: true, cumul: "Oui, deux fois par milieu, et pour chaque nouveau milieu.",
    bonus: "À chaque stage : 3 alliés (niveaux 1, 2 et 3) et 1 informateur (niveau 2) dans ce milieu.",
    capacites: [
      ["Culture populaire", "Relation de niveau 1 avec tous les membres du milieu choisi (le MJ peut faire des exceptions)."]
    ]
  },
  {
    niveau: 2, famille: "sportExtreme", nom: "Sport extrême niv. 2 « Base Jumper »",
    requis: {
      stages: ["sportExtreme:1"], caracs: { sangfroid: 4, reflexes: 3 }, competences: { athletisme: [6, "course"] },
      autre: "Athlétisme [saut] 6+"
    },
    cumulable: true, cumul: "Oui, pour les capacités.",
    capacites: [
      ["Yamakasi", "Lors d'une chute, 1 à 3 points d'Adrénaline : descend d'un cran par point sur la table des chutes et se réceptionne toujours sur les pieds."],
      ["Casse-cou", "1 point d'Adrénaline : relance un jet d'Athlétisme raté (autant de fois que ses points le permettent)."]
    ]
  },
  {
    niveau: 2, famille: "survie", nom: "Survie niv. 2 « Rambo »",
    requis: { stages: ["survie:1"], caracs: { carrure: 4 }, competences: { premiersSecours: 6 } },
    cumul: "Non.",
    capacites: [
      ["Robinson Crusoé", "En détresse, sait signaler sa position : ceux qui le cherchent gagnent +2 dés en Perception."]
    ]
  },
  {
    niveau: 2, famille: "interrogatoire", nom: "Technique d'interrogatoire niv. 2",
    requis: { stages: ["interrogatoire:1"], competences: { psychologie: 5 } },
    cumulable: true, cumul: "Oui, pour les capacités.",
    bonus: `${DE_BLEU} au jet initial de Psychologie/Perception (2) lors d'une rencontre.`,
    capacites: [
      ["Duettiste", "Si deux membres du groupe l'ont et interrogent ensemble, les bonus de résistance du suspect baissent de 1."]
    ]
  },
  {
    niveau: 2, famille: "tir", nom: "Tir niv. 2 « Wyatt Earp »",
    requis: { stages: ["tir:1"], caracs: { coordination: 4 }, options: [{ competences: { armePoing: 5 } }, { competences: { armeEpaule: 5 } }] },
    cumulable: true, cumul: "Oui, jusqu'à ±3.",
    bonus: "±1 à la localisation de ses tirs par stage, appliqué au choix après le jet, sans dépasser la marge de réussite.",
    capacites: [
      ["Tir sûr", "−2 à ses jets sur la table des dommages collatéraux."],
      ["Rechargement rapide", "Recharge deux fois plus vite (arrondi inférieur, minimum 1 tour)."],
      ["Double détente", "Tire avec deux armes de poing (rafales possibles). Même cible : pas de malus ; deux cibles : −2 dés par tir ; tir raté : +2 sur les dommages collatéraux. En tir de couverture : +2 dés par arme et réussites cumulées."]
    ]
  },
  {
    niveau: 2, famille: "nadiv", nom: "NADIV niv. 2 « Dope master »",
    requis: {
      stages: ["nadiv:1", "infiltration:1"], caracs: { perception: 3, charme: 4 }, competences: { connaissance: [6, "drogue"] },
      autre: "une relation (allié ou informateur) de niveau 2 dans une organisation criminelle"
    },
    cumul: "Non.",
    capacites: [
      ["Caïd", "1 point d'Ancienneté : obtient de ses contacts criminels une information de niveau +1 ou un service important (attention au SAD)."]
    ]
  },

  /* ============================ NIVEAU 3 ============================ */
  {
    niveau: 3, famille: "animal", nom: "Adaptation au comportement animal « Toutous & serpents »",
    requis: { caracs: { sangfroid: 5 } },
    cumulable: true, cumul: "Oui, deux fois.",
    bonus: "Les animaux qui l'attaquent perdent 1 dé par stage suivi (2 au maximum).",
    capacites: [
      ["Empathie animale", "1 point d'Ancienneté : calme un animal agressif à moins de 10 m pour une heure, même contre l'ordre de son maître."],
      ["Psychologie animale", "Jet de Perception (3), sans perdre son action : devine les prochaines actions d'un animal observé."]
    ]
  },
  {
    niveau: 3, famille: "commando", nom: "Commando niv. 2 « Opération ninja blanc »",
    requis: { stages: ["commando:1"], caracs: { perception: 4, sangfroid: 4 }, competences: { tirEnRafales: 5 } },
    cumul: "Non.",
    bonus: "Sur un jet de Carrure, Coordination, Réflexes ou Sang-froid, chaque point d'Ancienneté dépensé compte double.",
    capacites: [
      ["Rafale maîtrisée", "En rafale courte, peut placer toutes ses balles dans la même localisation."]
    ]
  },
  {
    niveau: 3, famille: "artMartial", nom: "Art martial niv. 3 « Vida »",
    requis: { stages: ["artMartial:2"], caracs: { coordination: 5 } },
    cumulable: true, cumul: "Oui, pour les capacités spéciales.",
    bonus: "Doit s'entraîner 2 h par jour pour conserver ses capacités.",
    capacites: [
      ["Intouchable", `${DE_BLEU} pour réussir une projection ; ses projections ont FA +3.`],
      ["Paralysie", `Nécessite Maître des clés. ${DE_BLEU} en immobilisation (mains nues ou tonfa) ; la victime doit perdre 6 PV pour tenter de se libérer, et 2 de plus en cas d'échec.`],
      ["Réaction éclair", "Braqué à bout portant : 1 point d'Adrénaline pour saisir le bras armé, sortir de la ligne de feu et frapper ; l'adversaire ne peut que se défendre. Pour utiliser son arme, le tireur doit ensuite gagner une opposition de Carrure."],
      ["Zanshin", "+2 dés en Instinct de flic pour repérer une embuscade ; n'est jamais surpris."]
    ]
  },
  {
    niveau: 3, famille: "dea", nom: "DEA niv. 3 « Service commandé »",
    requis: { stages: ["dea:2"], caracs: { sangfroid: 4 }, competences: { connaissance: [6, "drogue"] } },
    cumul: "Non.",
    capacites: [
      ["Immunisé", "Poches et filtres implantés : peut simuler la prise de drogues inhalées, avalées ou injectées sans en subir les effets (pas contre les drogues volatiles ou de contact ; poches vidées par un médecin de la police)."]
    ]
  },
  {
    niveau: 3, famille: "combatLocalite", nom: "Combat de localité niv. 3 « Galette des rois »",
    requis: { stages: ["combatLocalite:2"], competences: { instinctDeFlic: 4, tirEnRafales: [4, "épaule"] } },
    cumul: "Non.",
    capacites: [
      ["Slice the pie", "En zone d'intervention et prêt au combat : une surprise totale devient partielle, une surprise partielle disparaît. Choisit son attitude après les autres."]
    ]
  },
  {
    niveau: 3, famille: "communication", nom: "Communication médiatique niv. 3 « Mass guru »",
    requis: {
      stages: ["communication:2"], caracs: { education: 3 }, competences: { rhetorique: 5, connaissance: [4, "secte|religion"] },
      autre: "une relation de niveau 2 au sein de l'OCOB"
    },
    cumul: "Non.",
    bonus: "En opposition de Rhétorique, l'interlocuteur subit +2 à sa difficulté ; en interrogatoire à la Rhétorique, son bonus d'attitude tombe à 0.",
    capacites: [
      ["Impertinence", "1 point d'Ancienneté : peut employer le mot « secte » en public sans être poursuivi pour discrimination religieuse."]
    ]
  },
  {
    niveau: 3, famille: "conduite", nom: "Conduite niv. 3 « Safety car »",
    requis: { stages: ["conduite:2"], caracs: { sangfroid: 5 }, competences: { conduite: [4, "voiture"] } },
    cumul: "Non.",
    bonus: "Lors d'un crash test en poursuite automobile, ignore le premier dé noir en échec.",
    capacites: [
      ["Booster", "En poursuite, peut gagner 1 dé blanc supplémentaire tous les trois tours (remplace Turbo)."]
    ]
  },
  {
    niveau: 3, famille: "criminalistique", nom: "Criminalistique niv. 3 « Premier de la classe »",
    requis: { stages: ["criminalistique:2"], caracs: { perception: 4, education: 4 } },
    cumul: "Non.",
    bonus: `${DE_BLEU} à tout jet impliquant l'Éducation.`,
    capacites: [
      ["Affaire prioritaire", "1 point d'Ancienneté : autopsies et analyses de son affaire passent en priorité, quel que soit le contexte politique."]
    ]
  },
  {
    niveau: 3, famille: "frappe", nom: "Frappe niv. 3 « Mohamed Ali »",
    requis: { stages: ["frappe:2"], caracs: { coordination: 5 }, competences: { corpsACorps: [4, "coups"] } },
    cumulable: true, cumul: "Oui, pour choisir une nouvelle capacité seulement.",
    bonus: "Sur un coup à mains nues, chaque point de marge s'applique à la fois aux bonus de dommages (niv. 1) et de localisation (niv. 2) déjà acquis.",
    capacites: [
      ["Coup de coude", "Annoncé avant la résolution : l'adversaire gagne +2 dés, mais si le personnage l'emporte, ses dommages sont doublés."],
      ["Uppercut", "Annoncé avant la résolution : l'adversaire gagne +2 dés, mais si le personnage l'emporte, la FA vaut 2 (4 à la tête)."]
    ]
  },
  {
    niveau: 3, famille: "procedures", nom: "Procédures de communication du LAPD niv. 3 « … Et je souris »",
    requis: { stages: ["procedures:2"], caracs: { charme: 5 }, competences: { bureaucratie: 4 } },
    cumul: "Non.",
    capacites: [
      ["Pistonné", "Peut suivre n'importe quel stage proposé sans remplir les prérequis (en payant les points de stage)."]
    ]
  },
  {
    niveau: 3, famille: "negociation", nom: "Négociation « Vendeur de voitures »",
    requis: { stages: ["psychologie:2"], caracs: { sangfroid: 5, charme: 5 } },
    cumulable: true, cumul: "Oui, pour obtenir la seconde capacité (bonus inchangé).",
    bonus: `${DE_BLEU} aux jets d'interrogatoire et de Psychologie.`,
    capacites: [
      ["Empathie", "1 point d'Ancienneté : calme un individu agressif au cours d'une discussion (pas en combat, ni sous l'effet d'une forte dose de drogue)."],
      ["Sixième sens", "Jet de Psychologie/Perception (3) et 1 point d'Ancienneté, sans perdre son action : devine ce que fera un individu au tour suivant."]
    ]
  },
  {
    niveau: 3, famille: "protection", nom: "Protection des personnalités niv. 3 « Gilet pare-balles »",
    requis: { stages: ["protection:2"], caracs: { charme: 5, sangfroid: 5 } },
    cumulable: true, cumul: "Oui, pour obtenir la seconde capacité.",
    capacites: [
      ["Résistance au sommeil", "Trois heures de sommeil par jour lui suffisent."],
      ["Sacrifice", "À moins de 2 m de la personne protégée : 1 point d'Ancienneté pour prendre à sa place une attaque à distance qui l'a touchée."]
    ]
  },
  {
    niveau: 3, famille: "sportExtreme", nom: "Sport extrême niv. 3 « Free Rider »",
    requis: {
      stages: ["sportExtreme:2"], caracs: { sangfroid: 5, reflexes: 4, carrure: 3 }, competences: { athletisme: [6, "course"] },
      autre: "Athlétisme [saut] 5+ et [escalade] 6+"
    },
    cumul: "Non.",
    bonus: "Lors d'un crash test en poursuite à pied, ignore le premier dé noir en échec.",
    capacites: [
      ["McClane style", "En sacrifiant définitivement 1 point d'Adrénaline (rachetable) : réussit automatiquement un exploit physique normalement impossible."]
    ]
  },
  {
    niveau: 3, famille: "survie", nom: "Survie niv. 3 « Predator »",
    requis: { stages: ["survie:2"], caracs: { perception: 4, sangfroid: 4 }, competences: { premiersSecours: 5 } },
    cumulable: true, cumul: "Oui, un milieu différent à chaque fois (montagne, mer, désert, forêt…).",
    capacites: [
      ["Jeremiah Johnson", `Dans son milieu de prédilection : ${DE_BLEU} en Athlétisme, Discrétion, Instinct de flic et Scène de crime.`]
    ]
  },
  {
    niveau: 3, famille: "tir", nom: "Tir niv. 3 « Lee Harvey Oswald »",
    requis: { stages: ["tir:2"], caracs: { coordination: 5 }, options: [{ competences: { armePoing: 4 } }, { competences: { armeEpaule: 4 } }] },
    cumulable: true, cumul: "Oui, pour choisir une nouvelle capacité seulement.",
    bonus: "Sur un tir, chaque point de marge s'applique à la fois aux bonus de dommages (niv. 1) et de localisation (niv. 2) déjà acquis.",
    capacites: [
      ["Tir rapide", "Tirs multiples avec la même arme : pas de malus sur le premier tir (−1 dé au deuxième, −2 au troisième…)."],
      ["Point faible", "En renonçant à 2 points de marge : ignore la protection de l'armure de la cible."],
      ["Sniper", "Après un tour complet à viser, +2 à la difficulté : touche la localisation de son choix."]
    ]
  },
  {
    niveau: 3, famille: "infiltration", nom: "Infiltration niv. 2 « Atelier ciné »",
    requis: { stages: ["infiltration:1"], competences: { eloquence: 5 } },
    cumul: "—",
    capacites: [
      ["Domination", "Par l'aplomb et la manipulation, se fait passer pour qui il prétend être (contrôle de sécurité modeste, faux officier, représentant…) : jets d'Éloquence/Éducation selon l'interlocuteur. Mentir ouvertement peut lui être reproché au tribunal."]
    ]
  },
  {
    niveau: 3, famille: "nadiv", nom: "NADIV niv. 3 « Dope lord »",
    requis: { stages: ["nadiv:2"], caracs: { perception: 3, charme: 4, sangfroid: 5 }, competences: { connaissance: [5, "drogue"] } },
    cumul: "Non.",
    capacites: [
      ["Permis de tuer", "En sacrifiant définitivement 1 point d'Ancienneté (rachetable) : la hiérarchie couvre l'exécution d'un criminel précis et son maquillage."]
    ]
  }
];

const NOTE_DE_BLEU = "<p class=\"aide\">Dé bleu : un des dés lancés est un dé de stage ; s'il réussit, il compte pour deux réussites (un critique n'ajoute qu'une réussite de plus).</p>";

function descriptionHTML(s) {
  const lignes = [`<p><strong>Prérequis :</strong> ${formaterRequis(s.requis)}.</p>`];
  lignes.push(`<p><strong>Cumul :</strong> ${s.cumul ?? "Non."}</p>`);
  if (s.bonus) lignes.push(`<p><strong>Bonus :</strong> ${s.bonus}</p>`);
  if (s.capacites?.length) {
    const titre = s.capacites.length > 1 ? "Capacités spéciales (une au choix par stage suivi)" : "Capacité spéciale";
    lignes.push(`<p><strong>${titre} :</strong></p><ul>${s.capacites.map(([n, t]) => `<li><strong>${n}</strong> : ${t}</li>`).join("")}</ul>`);
  }
  if (JSON.stringify(s).includes("dé bleu")) lignes.push(NOTE_DE_BLEU);
  return lignes.join("");
}

/** Documents « stage » du compendium, avec un dossier par niveau. */
export function stages() {
  return STAGES.map(s => ({
    name: s.nom,
    type: "stage",
    img: "icons/svg/book.svg",
    dossier: `Niveau ${s.niveau}`,
    system: {
      niveau: s.niveau,
      famille: s.famille,
      prerequis: formaterRequis(s.requis),
      requis: s.requis ?? {},
      cumul: s.cumul ?? "Non.",
      cumulable: !!s.cumulable,
      capacites: (s.capacites ?? []).map(([n]) => n),
      capacite: "",
      cible: "",
      prix: "",
      description: descriptionHTML(s)
    }
  }));
}
