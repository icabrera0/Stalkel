import { test, expect, describe } from 'bun:test';
import { generateScenario } from '../js/generator.js';

describe('scenario shape', () => {
  test('same seed same result', () => {
    const a = generateScenario(12345, 'es');
    const b = generateScenario(12345, 'es');
    expect(a.suspect.name).toBe(b.suspect.name);
    expect(a.outcome).toBe(b.outcome);
    expect(a.girlfriend.name).toBe(b.girlfriend.name);
  });
  test('has all required top-level fields', () => {
    const s = generateScenario(99, 'es');
    for (const k of ['seed','lang','outcome','suspect','girlfriend','secretContact','appContent','realEvidenceIds','redHerringIds']) {
      expect(s).toHaveProperty(k);
    }
  });
  test('outcome is guilty or innocent', () => {
    const outcomes = new Set(Array.from({length:40}, (_,i) => generateScenario(i*1000,'es').outcome));
    expect(outcomes.has('guilty')).toBe(true);
    expect(outcomes.has('innocent')).toBe(true);
  });
  test('suspect name differs from girlfriend name', () => {
    for (let i = 0; i < 30; i++) {
      const s = generateScenario(i * 777, 'es');
      expect(s.suspect.name).not.toBe(s.girlfriend.name);
    }
  });
  test('guilty run has 5-7 real evidence IDs', () => {
    const guilty = Array.from({length:60},(_,i)=>generateScenario(i*13,'es')).filter(s=>s.outcome==='guilty');
    expect(guilty.length).toBeGreaterThan(0);
    for (const s of guilty) {
      expect(s.realEvidenceIds.length).toBeGreaterThanOrEqual(5);
      expect(s.realEvidenceIds.length).toBeLessThanOrEqual(7);
    }
  });
  test('innocent run has 0 real evidence IDs', () => {
    const innocent = Array.from({length:60},(_,i)=>generateScenario(i*17,'es')).filter(s=>s.outcome==='innocent');
    expect(innocent.length).toBeGreaterThan(0);
    for (const s of innocent) {
      expect(s.realEvidenceIds.length).toBe(0);
    }
  });
  test('all runs have 3-4 red herring IDs', () => {
    for (let i = 0; i < 30; i++) {
      const s = generateScenario(i * 31, 'es');
      expect(s.redHerringIds.length).toBeGreaterThanOrEqual(3);
      expect(s.redHerringIds.length).toBeLessThanOrEqual(4);
    }
  });
  test('no duplicate evidence IDs in any run', () => {
    for (let i = 0; i < 30; i++) {
      const s = generateScenario(i * 31, 'es');
      const all = [...s.realEvidenceIds, ...s.redHerringIds];
      expect(new Set(all).size).toBe(all.length);
    }
  });
  test('works in english', () => {
    const s = generateScenario(555, 'en');
    expect(s.lang).toBe('en');
    expect(s.suspect.name).toBeTruthy();
    expect(s.girlfriend.name).toBeTruthy();
  });
  test('appContent has all 7 apps', () => {
    const s = generateScenario(42, 'es');
    for (const app of ['instagram','whatsapp','revolut','twitter','maps','gallery','messages']) {
      expect(s.appContent).toHaveProperty(app);
    }
  });
  test('appContent.instagram has items array', () => {
    const s = generateScenario(42, 'es');
    expect(Array.isArray(s.appContent.instagram.items)).toBe(true);
    expect(s.appContent.instagram.items.length).toBeGreaterThan(0);
  });
  test('each app has items with id and evidenceId fields', () => {
    const s = generateScenario(42, 'es');
    for (const app of ['instagram','whatsapp','revolut','twitter','maps','gallery','messages']) {
      const data = s.appContent[app];
      const items = data.items || data;
      const arr = Array.isArray(items) ? items : Object.values(items).flat();
      expect(arr.length).toBeGreaterThan(0);
      for (const item of arr.slice(0, 3)) {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('evidenceId');
      }
    }
  });
  test('realEvidenceIds are present in appContent items', () => {
    const guilty = Array.from({length:60},(_,i)=>generateScenario(i*7,'es')).find(s=>s.outcome==='guilty');
    const allEvidenceIds = new Set();
    for (const app of Object.values(guilty.appContent)) {
      const items = Array.isArray(app.items) ? app.items : (Array.isArray(app) ? app : []);
      for (const item of items) {
        if (item.evidenceId) allEvidenceIds.add(item.evidenceId);
      }
    }
    for (const id of guilty.realEvidenceIds) {
      expect(allEvidenceIds.has(id)).toBe(true);
    }
  });
  test('secretContact is different from girlfriend', () => {
    for (let i = 0; i < 20; i++) {
      const s = generateScenario(i * 42, 'es');
      expect(s.secretContact.name).not.toBe(s.girlfriend.name);
    }
  });
});
