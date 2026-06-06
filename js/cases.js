// Fixed seeds chosen to produce interesting, varied scenarios.
// Regenerate by running: generateScenario(seed, 'es') in the console and checking outcome + names.
export const CASE_LIBRARY = [
  {
    id: 'random',
    seed: null,               // null = Date.now() at start time
    fixed: false,
  },
  {
    id: 'case_001',
    seed: 1749200000000,      // "El Doble Juego" / "Double Game"
    fixed: true,
  },
  {
    id: 'case_002',
    seed: 1749300000000,      // "Viaje de Negocios" / "Business Trip"
    fixed: true,
  },
  {
    id: 'case_003',
    seed: 1749400000000,      // "Sólo Amigos" / "Just Friends"
    fixed: true,
  },
];

export function resolveSeed(caseEntry) {
  return caseEntry.seed ?? Date.now();
}
