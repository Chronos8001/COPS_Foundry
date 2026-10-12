/**
 * Dans COPS l'initiative est choisie (-2 à +2) et la valeur la plus BASSE agit en premier.
 * En cas d'égalité : Réflexes les plus élevés, puis attitude la plus agressive.
 */
export class CopsCombat extends Combat {
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : Infinity;
    if (ia !== ib) return ia - ib;
    const ra = a.actor?.system.caracteristiques?.reflexes ?? 0;
    const rb = b.actor?.system.caracteristiques?.reflexes ?? 0;
    if (ra !== rb) return rb - ra;
    const aa = a.actor?.system.combat?.attitude ?? 0;
    const ab = b.actor?.system.combat?.attitude ?? 0;
    if (aa !== ab) return ab - aa;
    return (a.name ?? "").localeCompare(b.name ?? "");
  }
}

export class CopsCombatant extends Combatant {
  /** L'« initiative » est la valeur choisie sur la fiche (onglet Combat). */
  _getInitiativeFormula() {
    return String(this.actor?.system.combat?.initiative ?? 0);
  }
}
